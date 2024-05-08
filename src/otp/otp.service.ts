import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Otp, OtpType } from "./entities/otp.entity";
import { DataSource, In, Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private userRepository: Repository<Otp>,
    @InjectDataSource()
    private userDS: DataSource,
  ) {}

  verify(id: string, otpCode: string, user: User) {
    const otp = this.userRepository
      .createQueryBuilder("otp")
      .where("otp.id = :id", { id })
      .andWhere("otp.otp = :otpCode", { otpCode })
      .andWhere("otp.expiresAt > NOW()")
      .andWhere("otp.used = 0")
      .andWhere("otp.userId = :userId", { userId: user.id })
      .getOne();

    if (!otp) {
      throw new BadRequestException("Invalid OTP code.");
    }

    // Handle the verification type here

    // if (otp.type === OtpType.RESET_PASSWORD)
  }
  async createOtp(user: User, type: OtpType) {
    const code = Math.floor(10000 + Math.random() * 90000);
    const otpObj = new Otp();
    otpObj.otp = code.toString();
    otpObj.type = type;
    otpObj.userId = user.id;
    otpObj.expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes
    const otp = this.userRepository.create(otpObj);

    const queryRunner = this.userDS.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Otp, { userId: user.id, type });
      await queryRunner.manager.save(otp);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException("Failed to create OTP.");
    }
  }

  async deleteOTPs(user: User, types: OtpType[]) {
    await this.userRepository.delete({ userId: user.id, type: In(types) });
  }
}
