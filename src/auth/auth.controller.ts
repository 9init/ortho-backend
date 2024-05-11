import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Res,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/singin.dto";
import { AuthGuard } from "./auth.guard";
import { SignedAccessToken } from "src/user/user-token.decorator";
import { SignUpRequestDto } from "./dto/singup-request.dto";
import { SignUpDto } from "./dto/singup.dto";
import { RequestResetDto } from "./dto/request-reset.dto";
import { ResetPasswordDto } from "./dto/reset-dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("/signin")
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const user = await this.authService.signIn(signInDto);
    const token = await this.authService.generateJwtToken(
      user,
      request.headers,
    );

    response.cookie("token", token, {
      httpOnly: true, // Make the cookie accessible only via HTTP (not JavaScript)
      secure: process.env.NODE_ENV == "production", // Set to true in production for HTTPS
      sameSite: "strict", // Prevent CSRF attacks
      path: "/", // To make all paths valid for cookies
    });

    return user;
  }

  @Post("/request-singup")
  async requestSingUp(@Body() singUpReqDto: SignUpRequestDto) {
    return this.authService.requestSignUp(singUpReqDto);
  }

  @Post("/signup")
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("/logout")
  @UseGuards(AuthGuard)
  async logout(@SignedAccessToken() tokenSignature: string) {
    return this.authService.logout(tokenSignature);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/token-info")
  @UseGuards(AuthGuard)
  tokenInfo(@SignedAccessToken() tokenSignature: string) {
    return this.authService.tokenInfo(tokenSignature);
  }

  @HttpCode(HttpStatus.OK)
  @Post("/request-reset")
  requestReset(@Body() { email }: RequestResetDto) {
    return this.authService.requestReset(email);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post("/reset")
  resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }
}
