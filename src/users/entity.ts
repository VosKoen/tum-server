import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column
  } from "typeorm";
  import { Exclude } from "class-transformer";
  import { MinLength, IsString, IsEmail } from "class-validator";
  import * as bcrypt from "bcrypt";
  
  @Entity()
  export default class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number;
  
    @IsEmail()
    @Column("text")
    email: string;
  
    @IsString()
    @MinLength(8)
    @Column("text")
    @Exclude({ toPlainOnly: true })
    password: string;
  
    async setPassword(rawPassword: string) {
      const hash = await bcrypt.hash(rawPassword, 8);
      this.password = hash;
    }
  
    checkPassword(rawPassword: string): Promise<boolean> {
      return bcrypt.compare(rawPassword, this.password);
    }
  }
  