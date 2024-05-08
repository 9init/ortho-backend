import { Controller, Get, UseGuards } from "@nestjs/common";
import { HomeService } from "./home.service";
import { LoggedInUser } from "src/user/logged-in-user.decorator";
import { User } from "src/user/entities/user.entity";
import { AuthGuard } from "src/auth/auth.guard";

@Controller("home")
@UseGuards(AuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  findAll(@LoggedInUser() user: User) {
    return this.homeService.findAll(user);
  }
}
