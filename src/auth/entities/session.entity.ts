import { Exclude } from "class-transformer";
import { User } from "src/user/entities/user.entity";
import {
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  BeforeInsert,
  Index,
  DeleteDateColumn,
  Entity,
  CreateDateColumn,
} from "typeorm";
import { ulid } from "ulid";

@Entity()
export class Session {
  @PrimaryColumn("char", {
    length: 26,
  })
  id: string;

  @BeforeInsert()
  setId() {
    this.id = ulid();
  }

  @Column({ type: "char", length: 26, nullable: false })
  @Index("idx_session_user_id")
  userId: string;

  @ManyToOne(() => User, (User) => User.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column("text")
  @Exclude()
  sessionToken: string;

  @Column({ type: "char", length: 44, unique: true }) // SHA-1
  @Index("idx_session_token_signature")
  tokenSignature: string;

  @Column("text")
  @Exclude()
  userAgent: string;

  @BeforeInsert()
  private getSignedToken() {
    // Extract the signature from the JWT token and store it in the tokenSignature field.
    // This allows us to access and search for the token signature in the database.
    // Storing only the token signature helps optimize database storage and indexing while maintaining security.

    const signature = this.sessionToken.split(".")[2];
    this.tokenSignature = signature;
  }

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public createdAt: Date;

  // Without this column soft deletes will not work
  // Check this: https://doug-martin.github.io/nestjs-query/docs/persistence/typeorm/soft-delete/
  @DeleteDateColumn()
  deletedAt?: Date;
}
