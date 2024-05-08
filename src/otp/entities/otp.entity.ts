import { User } from "src/user/entities/user.entity";
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { ulid } from "ulid";

export enum OtpType {
  RESET_PASSWORD = "RESET_PASSWORD",
  VERIFY_EMAIL = "VERIFY_EMAIL",
}

@Entity()
export class Otp {
  @PrimaryColumn("char", {
    length: 26,
  })
  id: string;

  @BeforeInsert()
  setId() {
    this.id = ulid();
  }

  @Column("char", {
    length: 5,
  })
  otp: string;

  @Column("enum")
  type: OtpType;

  @Column("char", {
    length: 26,
  })
  userId: string;

  @Column()
  isUsed: boolean;

  @Column("datetime")
  expiresAt: Date;

  @Column()
  verifiedAt: Date;

  // *** Relations *** //

  @ManyToOne(() => User, (user) => user.id)
  user: User;
}
