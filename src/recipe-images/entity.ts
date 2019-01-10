import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import Recipe from '../recipes/entity'

@Entity()
export default class RecipeImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text", { nullable: false })
  imageUrl: string;

  @Column("decimal", { nullable: true })
  conversionRate: number;

  @Column("int", { nullable: false })
  recipeId: number;

  @ManyToOne(_ => Recipe, recipe => recipe.recipeImages,{onDelete:"CASCADE"})
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

}