import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { compriseImage } from "src/shared/image.helper";
import { PredictResult, Scan } from "./entities/scan.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ScanService {
  constructor(
    @InjectRepository(Scan) private scanRepository: Repository<Scan>,
  ) {}
  async scanFile(user: User, file: Express.Multer.File) {
    const compressedImage = await compriseImage(file);

    const lipline: PredictResult = {
      title: "Lipline",
      description: "A line that is drawn around the lips.",
      classes: [0.012758, 0.323, 0.987242],
      labels: ["Low", "Medium", "High"],
      predictedIndex: 2,
    };

    const buccalCorridor: PredictResult = {
      title: "Buccal Corridor",
      description: "The dark space between the upper molars and the cheek.",
      classes: [0.94, 0.572, 0.214],
      labels: ["Low", "Medium", "High"],
      predictedIndex: 0,
    };

    const scanData: Scan = new Scan();
    scanData.userId = user.id;
    scanData.data = [lipline, buccalCorridor];
    scanData.image = compressedImage.toString();

    const scanModel = await this.scanRepository.create(scanData);
    const scan = await this.scanRepository.save(scanModel);
    scan.image = process.env.HOST + "/scan/image/" + scan.id;
    return scan;
  }

  async getImage(id: number) {
    const scan = await this.scanRepository.findOneBy({ id });

    if (!scan) {
      throw new BadRequestException("Scan not found");
    }

    const base64Image = scan.image.toString();
    return Buffer.from(base64Image, "base64");
  }

  async getRecentScans(user: User): Promise<Scan[]> {
    const scans = await this.scanRepository.find({
      where: { userId: user.id },
      order: { createdAt: "DESC" },
    });
    scans.forEach((scan) => {
      scan.image = process.env.HOST + "/scan/image/" + scan.id;
    });
    return scans;
  }
}
