import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  Index,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { ulid } from "ulid";
import { Exclude } from "class-transformer";
import { CreateUserDto } from "../dto/create-user.dto";
import { Otp } from "src/otp/entities/otp.entity";

@Entity()
export class User implements CreateUserDto {
  @PrimaryColumn("char", {
    length: 26,
  })
  id: string;

  @BeforeInsert()
  setId() {
    this.id = ulid();
  }

  @Column()
  @Index("idx_user_name")
  name: string;

  @Column({ unique: true, nullable: false })
  @Index("idx_user_email")
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  canChangePassword: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  // join otps table using user_id and where otp.isUsed = false and otp.expiresAt > now()
  @OneToMany(() => Otp, (otp) => otp.user, { cascade: true })
  otps: Otp[];
}
