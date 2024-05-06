import { IsNotEmpty, IsString } from "class-validator";
import { IsUsernameOrEmail } from "src/decorators/isUsernameOrEmail";

export class SignInDto {
  @IsString()
  @IsUsernameOrEmail()
  @IsNotEmpty()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
