import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Header,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ScanService } from "./scan.service";
import { Response } from "express";
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
  @Header("Content-Type", "image/jpeg")
  async getImage(
    @LoggedInUser() user: User,
    @Param("id") id: number,
    @Res() res: Response,
  ) {
    const imageBuffer = await this.scanService.getImage(id);
    res.send(imageBuffer);
  }
}
