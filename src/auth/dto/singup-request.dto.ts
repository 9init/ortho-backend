import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";
import { IsUsername } from "src/decorators/isUsername";

export class SignUpRequestDto {
  @MinLength(3)
  @Matches(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/, {
    message: "name is invalid",
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsUsername()
  username: string;
}
