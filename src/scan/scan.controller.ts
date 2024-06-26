import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  UseGuards,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { ScanService } from "./scan.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { LoggedInUser } from "src/user/logged-in-user.decorator";
import { User } from "src/user/entities/user.entity";
import { AuthGuard } from "src/auth/auth.guard";

@Controller("scan")
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @UseGuards(AuthGuard)
  scanFile(
    @LoggedInUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.scanService.scanFile(user, file);
  }

  @Get("/image/:id")
  async getImage(@Param("id") id: number, @Res() res: Response) {
    const imageBuffer = await this.scanService.getImage(id);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  }
}
