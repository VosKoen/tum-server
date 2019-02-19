import { Entity, ManyToOne, Column, JoinColumn, PrimaryColumn } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import Ingredient from "../ingredients/entity";
import Recipe from '../recipes/entity'
import IngredientAmountType from "../ingredient-amount-types/entity";

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

  @Column("decimal", { nullable: false })
  amount: number;

  @Column("int", { nullable: false })
  amountType: number;

  @ManyToOne(_ => IngredientAmountType, ingredientAmountType => ingredientAmountType.ingredients)
  @JoinColumn({ name: "amount_type" })
  ingredientAmountType: IngredientAmountType;
}
