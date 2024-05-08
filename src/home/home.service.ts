import { Injectable } from "@nestjs/common";
import { ScanService } from "src/scan/scan.service";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class HomeService {
  constructor(private readonly scanService: ScanService) {}

  async findAll(user: User) {
    const recentScans = await this.scanService.getRecentScans(user);
    return { user, recentScans };
  }
}
