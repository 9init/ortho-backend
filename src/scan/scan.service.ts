import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { compriseImage } from "src/shared/image.helper";
import { Scan } from "./entities/scan.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
// import { File } from "@web-std/file";

import axios from "axios";

export class Predictions {
  title: string;
  description: string;
  classes: number[];
  labels: string[];
  predictedIndex: number;
}

export class ScanResult {
  image: string;
  predictions: Predictions[];
}

@Injectable()
export class ScanService {
  constructor(
    @InjectRepository(Scan) private scanRepository: Repository<Scan>,
  ) {}
  async scanFile(user: User, file: Express.Multer.File) {
    const compressedImage = await compriseImage(file);
    const modelHost = process.env.MODEL_HOST;

    // send form data container the compressed image as file - multipart
    const formData = new FormData();
    const blob = new Blob([Buffer.from(compressedImage, "base64")], {
      type: "image/jpeg",
    });
    // const fileOF = new File([blob], "image.jpg");
    formData.append("file", blob);

    try {
      // call the api
      const response = await axios.post(`${modelHost}/scan`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // parse response to ScanResult class
      const scanResult: ScanResult = response.data;
      const scanData: Scan = new Scan();
      scanData.userId = user.id;
      scanData.data = scanResult.predictions;
      scanData.image = scanResult.image;

      const scanModel = await this.scanRepository.create(scanData);
      const scan = await this.scanRepository.save(scanModel);
      scan.image = process.env.HOST + "/scan/image/" + scan.id;
      return scan;
    } catch (err) {
      // handle 400 error
      if (err?.response?.status == 400) {
        throw new BadRequestException("Invalid image, no face detected");
      } else {
        throw new BadRequestException("Failed to scan image");
      }
    }
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
