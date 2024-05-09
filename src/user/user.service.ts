import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { DataSource, Repository } from "typeorm";
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

  createOne(userDto: CreateUserDto) {
    const user = this.userRepository.create(userDto);
    return this.userRepository
      .save(user)
      .then(async (res) => {
        const otp = await this.otpService.createOtp(res, OtpType.VERIFY_EMAIL);
        return otp.id;
      })
      .catch((err) => {
        console.log(err);
        if (err.code == "ER_DUP_ENTRY") {
          throw new ConflictException("email already exists.");
        }
      });
  }

  async findOne(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
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
      where: { email },
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
}
