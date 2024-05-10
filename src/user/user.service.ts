import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { OtpService } from "src/otp/otp.service";
import { OtpType } from "src/otp/entities/otp.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectDataSource()
    private userDS: DataSource,
    private readonly otpService: OtpService,
  ) {}

  async createOne(userDto: CreateUserDto) {
    const queryRunner = this.userDS.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let user = this.userRepository.create(userDto);
      await queryRunner.manager.delete(User, {
        email: user.email,
        emailVerified: false,
      });
      user = await queryRunner.manager.save(user);
      const otp = await this.otpService.createOtp(
        user,
        OtpType.VERIFY_EMAIL,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return otp.id;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code == "ER_DUP_ENTRY") {
        throw new ConflictException("email already exists.");
      }
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id, emailVerified: true },
      // relations: {
      //   otps: true,
      // },
    });

    if (!user)
      throw new NotFoundException(
        "Invalid User ID key reference. The referenced row does not exist.",
      );

    return user;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email, emailVerified: true },
    });
  }

  async update(user: User, updateUserDto: UpdateUserDto) {
    const queryRunner = this.userDS.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    Object.assign(user, updateUserDto);
    try {
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async verifyEmail(id: string, queryRunner: QueryRunner) {
    const user = await this.userRepository.findOneBy({ id });
    user.emailVerified = true;
    await queryRunner.manager.save(user);
  }

  async allowPasswordReset(id: string, queryRunner: QueryRunner) {
    const user = await this.userRepository.findOneBy({ id });
    user.canChangePassword = true;
    await queryRunner.manager.save(user);
  }
}
