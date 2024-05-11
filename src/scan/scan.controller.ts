import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Header,
  UseGuards,
  StreamableFile,
} from "@nestjs/common";
import { ScanService } from "./scan.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { LoggedInUser } from "src/user/logged-in-user.decorator";
import { User } from "src/user/entities/user.entity";
import { AuthGuard } from "src/auth/auth.guard";

@Controller("scan")
@UseGuards(AuthGuard)
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  scanFile(
    @LoggedInUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.scanService.scanFile(user, file);
  }

  @Get("/image/:id")
  async getImage(@LoggedInUser() user: User, @Param("id") id: number) {
    const imageBuffer = await this.scanService.getImage(user, id);
    return new StreamableFile(imageBuffer, { type: "image/jpeg" });
  }
}
