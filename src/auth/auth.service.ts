import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import DeviceDetector from "node-device-detector";
import { comparePasswords } from "src/decorators/hash-password/helper";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { DetailedSession } from "./dto/detailed-session.dto";
import { SignInDto } from "./dto/singin.dto";
import { Session } from "./entities/session.entity";
import { SignUpRequestDto } from "./dto/singup-request.dto";
import { SignUpDto } from "./dto/singup.dto";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { plainToInstance } from "class-transformer";
import { OtpService } from "src/otp/otp.service";
import { OtpType } from "src/otp/entities/otp.entity";
import { ResetPasswordDto } from "./dto/reset-dto";

const deviceDetector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

@Injectable()
export class AuthService extends TypeOrmQueryService<Session> {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectRepository(Session)
    public sessionRepository: Repository<Session>,
    private readonly otpService: OtpService,
  ) {
    super(sessionRepository, { useSoftDelete: true });
  }

  async requestSignUp(singUpReqDto: SignUpRequestDto) {
    const payload = {
      name: singUpReqDto.name,
      email: singUpReqDto.email,
    };

    const emailFind = await this.userService.findOneByEmail(payload.email);

    if (emailFind) {
      throw new BadRequestException("email already exists");
    }

    const continuationKey = await this.jwtService.signAsync(payload, {
      expiresIn: "15m",
    });

    return { continuationKey };
  }

  async signUp(singUpDto: SignUpDto) {
    const { continuationKey, password } = singUpDto;
    try {
      const payload = (await this.jwtService.verifyAsync(continuationKey)) as {
        name: string;
        email: string;
      };

      const user = new CreateUserDto();
      user.name = payload.name;
      user.email = payload.email;
      user.password = password;

      return this.userService.createOne(plainToInstance(CreateUserDto, user));
    } catch (err) {
      throw new BadRequestException(
        "Session expired, please request a new sign up request.",
      );
    }
  }

  async signIn(signInDto: SignInDto): Promise<User> {
    const { identifier, password } = signInDto;
    const user = await this.userService.findOneByEmail(identifier);

    if (!user || !(await comparePasswords(password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async generateJwtToken(
    user: User,
    headers: { "user-agent"?: string },
  ): Promise<string> {
    // Generate a new JWT token for the session
    const payload = { sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);

    // Create a new session and store the JWT token in the session
    const session = new Session();
    session.sessionToken = accessToken;
    session.userId = user.id;
    session.userAgent = headers["user-agent"];
    // Save the session in the database
    await this.sessionRepository.save(session);
    return accessToken;
  }

  async tokenInfo(tokenSignature: string) {
    const session = (await this.sessionRepository.findOneByOrFail({
      tokenSignature,
    })) as DetailedSession;

    session.device = deviceDetector.detect(session.userAgent);
    return session;
  }

  async logout(tokenSignature: string) {
    return this.sessionRepository.softDelete({ tokenSignature });
  }

  async requestReset(email: string) {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const otp = await this.otpService.createOtp(user, OtpType.RESET_PASSWORD);
    return otp.id;
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    await this.userService.resetPassword(resetDto.token, resetDto.password);
  }
}
