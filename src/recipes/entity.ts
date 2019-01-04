import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import Step from "../recipe-steps/entity";
import Ingredient from "../ingredients/entity";

@Entity()
export default class Recipe extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text", { nullable: false })
  name: string;

  @Column("text", { nullable: false })
  description: string;

  @OneToMany(_ => Step, step => step.recipe)
  steps: Step[];

  @ManyToMany(_ => Ingredient)
  @JoinTable()
  ingredients: Ingredient[];
}
