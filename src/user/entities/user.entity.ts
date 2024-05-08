import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  Index,
  DeleteDateColumn,
} from "typeorm";
import { ulid } from "ulid";
import { Exclude } from "class-transformer";
import { CreateUserDto } from "../dto/create-user.dto";

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

  @DeleteDateColumn()
  deletedAt?: Date;
}
