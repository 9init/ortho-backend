import {
  Controller,
  Get,
  Body,
  Patch,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { LoggedInUser } from "./logged-in-user.decorator";
import { User } from "./entities/user.entity";

@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  findOne(@LoggedInUser() user: User) {
    return user;
  }

  @Patch(":id")
  @HttpCode(204)
  update(@LoggedInUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(user, updateUserDto);
  }

  @Get()
  getUser(@LoggedInUser() user: User) {
    return user;
  }
}
