import { Entity, Column, JoinColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import Ingredient from "../ingredients/entity";
import Recipe from '../recipes/entity'
import IngredientAmountType from "../ingredient-amount-types/entity";
import IngredientAmountTypeUnits from "../ingredient-amount-type-units/entity";

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
  amountNumber: number;

  @Column("int", { nullable: false })
  amountType: number;

  @Column("int", { nullable: true })
  amountTypeUnit: number;

  // @ManyToOne(_ => IngredientAmountType, ingredientAmountType => ingredientAmountType.ingredients)
  // @JoinColumn({ name: "amount_type" })
  // ingredientAmountType: IngredientAmountType;

  @ManyToOne(_ => IngredientAmountType)
  @JoinColumn({name: "amount_type"})
  IngredientAmountType: IngredientAmountType;

  @ManyToOne(_ => IngredientAmountTypeUnits)
  @JoinColumn({name: "amount_type_unit"})
  IngredientAmountTypeUnit: IngredientAmountTypeUnits;

}
