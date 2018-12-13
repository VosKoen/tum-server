import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import Recipe from '../recipes/entity'

@Entity()
export default class Step extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("int", { nullable: false })
  order: number;

  @Column("text", { nullable: false })
  description: string;

  @Column("int", { nullable: true })
  recipeId: number;

  @ManyToOne(_ => Recipe, recipe => recipe.steps,{onDelete:"CASCADE"})
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

}