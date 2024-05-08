import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
