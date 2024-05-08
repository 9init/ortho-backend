import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";

export class SignUpRequestDto {
  @MinLength(3)
  @Matches(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/, {
    message: "name is invalid",
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
