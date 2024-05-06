import { IsJWT, IsNotEmpty, IsStrongPassword } from "class-validator";

export class SignUpDto {
  @IsNotEmpty()
  @IsJWT()
  continuationKey: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
