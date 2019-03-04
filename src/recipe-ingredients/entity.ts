import { Entity, Column, JoinColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import Ingredient from "../ingredients/entity";
import Recipe from '../recipes/entity'

@Entity()
export default class RecipeIngredient extends BaseEntity {

  @ManyToOne(_ => Recipe, recipe => recipe.recipeIngredients, {primary: true, onDelete:"CASCADE"})
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(_ => Ingredient, ingredient => ingredient.recipeIngredients, {primary:true})
  @JoinColumn({ name: "ingredient_id" })
  ingredient: Ingredient;

  @PrimaryColumn()
  recipeId: number;

  @PrimaryColumn()
  ingredientId: number;

  @Column("text", { nullable: false })
  amount: string;

}
