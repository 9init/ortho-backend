import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { HashPassword } from "src/decorators/hash-password/hash-password.decorator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @HashPassword()
  password: string;
}
