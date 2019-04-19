import { Entity, JoinColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import Label from "../labels/entity";
import Recipe from '../recipes/entity'

@Entity()
export default class RecipeLabel extends BaseEntity {

  @ManyToOne(_ => Recipe, recipe => recipe.recipeIngredients, {primary: true, onDelete:"CASCADE"})
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(_ => Label, label => label.recipeLabels, {primary:true})
  @JoinColumn({ name: "label_id" })
  label: Label;

  @PrimaryColumn()
  recipeId: number;

  @PrimaryColumn()
  labelId: number;

}
