import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
  } from "typeorm";
  import { BaseEntity } from "typeorm/repository/BaseEntity";   
  import Step from "../recipe-steps/entity";
  
  @Entity()
  export default class Recipe extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number;
  
    @Column("text", { nullable: false })
    name: string;
  
    @OneToMany(_ => Step, step => step.recipe)
    steps: Step[];
  }
  