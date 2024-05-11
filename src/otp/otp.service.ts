import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Otp, OtpType } from "./entities/otp.entity";
import { DataSource, In, QueryRunner, Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { MailService } from "src/mail/mail.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class OtpService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectDataSource()
    private userDS: DataSource,
    private readonly mailService: MailService,
  ) {}

  async verify(id: string, otpCode: string) {
    const otp = await this.otpRepository
      .createQueryBuilder("otp")
      .where("otp.id = :id", { id })
      .andWhere("otp.otp = :otpCode", { otpCode })
      .andWhere("otp.expiresAt > NOW()")
      .andWhere("otp.isUsed = 0")
      .andWhere("otp.verifiedAt IS NULL")
      .getOne();

    if (!otp) {
      throw new BadRequestException("Invalid OTP code.");
    }

    otp.verifiedAt = new Date();
    otp.isUsed = true;
    // this.otpRepository.save(otp);

    const queryRunner = this.userDS.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(otp);

      let data = null;
      if (otp.type === OtpType.RESET_PASSWORD) {
        data = await this.userService.allowPasswordReset(
          otp.userId,
          queryRunner,
        );
      } else if (otp.type === OtpType.VERIFY_EMAIL) {
        await this.userService.verifyEmail(otp.userId, queryRunner);
      }

      await queryRunner.commitTransaction();

      if (data) return data;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new BadRequestException("Failed to verify OTP.");
    }

    return;
  }

  async createOtp(user: User, type: OtpType, queryRunner: QueryRunner = null) {
    const code = Math.floor(10000 + Math.random() * 90000);
    const otpObj = new Otp();
    otpObj.otp = code.toString();
    otpObj.type = type;
    otpObj.userId = user.id;
    otpObj.expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes
    const otp = this.otpRepository.create(otpObj);

    const _queryRunner = queryRunner || this.userDS.createQueryRunner();
    if (!queryRunner) {
      await _queryRunner.connect();
      await _queryRunner.startTransaction();
    }

    try {
      await _queryRunner.manager.delete(Otp, { userId: user.id, type });
      const otpDb = await _queryRunner.manager.save(otp);

      if (!queryRunner) await _queryRunner.commitTransaction();

      this.mailService.sendEmail(
        user.email,
        "OTP",
        `here is your OTP: ${code}`,
      );

      return otpDb;
    } catch (error) {
      await _queryRunner.rollbackTransaction();
      console.log(error);
      throw new BadRequestException("Failed to create OTP.");
    }
  }

  async resentOtp(oldOtpId: string) {
    const queryRunner = this.userDS.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldOtp = await this.otpRepository.findOne({
        where: { id: oldOtpId },
        relations: { user: true },
      });

      if (!oldOtp) {
        throw "Invalid OTP ID.";
      }

      await this.deleteOTPs(oldOtp.user, [oldOtp.type], queryRunner);
      const otp = await this.createOtp(oldOtp.user, oldOtp.type, queryRunner);
      await queryRunner.commitTransaction();
      return otp.id;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException("Failed to resend OTP.");
    }
  }

  async deleteOTPs(
    user: User,
    types: OtpType[],
    queryRunner: QueryRunner = null,
  ) {
    if (queryRunner) {
      await queryRunner.manager.delete(Otp, {
        userId: user.id,
        type: In(types),
      });
      return;
    }
    await this.otpRepository.delete({ userId: user.id, type: In(types) });
  }
}
