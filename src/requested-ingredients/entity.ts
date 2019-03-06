import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
  } from "typeorm";
  import { BaseEntity } from "typeorm/repository/BaseEntity";
  import User from '../users/entity'
  
  @Entity()
  export default class RequestedIngredient extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number;
  
    @Column("text", { nullable: false })
    request: string;

    @Column("int", { nullable: false })
    userId: number;

    @ManyToOne(_ => User, user => user.requestedIngredients)
    @JoinColumn({ name: "user_id" })
    user: User;
  }