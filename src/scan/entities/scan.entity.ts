import { Exclude } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Scan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("char", { length: 26, nullable: false })
  userId: string;

  @Column("json", {})
  data: PredictResult[];

  @Column("mediumblob")
  @Exclude()
  image: string;

  @Column("datetime", { default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}

export class PredictResult {
  title: string;
  description: string;
  classes: number[];
  labels: string[];
  predictedIndex: number;
}
