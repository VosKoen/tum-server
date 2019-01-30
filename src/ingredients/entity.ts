import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import IngredientType from "../ingredient-types/entity";
import RecipeIngredient from '../recipe-ingredients/entity'

@Entity()
export default class Ingredient extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text", { nullable: false })
  name: string;

  @Column("text", { nullable: false })
  ingredientType: string;

  @OneToMany(_ => RecipeIngredient, recipeIngredient => recipeIngredient.ingredient)
  recipeIngredients: RecipeIngredient[];

  @ManyToOne(_ => IngredientType, type => type.ingredients)
  @JoinColumn({ name: "ingredient_type" })
  type: IngredientType;

}
