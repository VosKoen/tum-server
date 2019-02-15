import { Entity, ManyToOne, Column, JoinColumn, PrimaryColumn } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import User from "../users/entity";
import Recipe from '../recipes/entity'

@Entity()
export default class RecipeUserRating extends BaseEntity {

  @ManyToOne(_ => Recipe, recipe => recipe.recipeUserRatings, {primary: true})
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(_ => User, user => user.recipeUserRatings, {primary:true})
  @JoinColumn({ name: "user_id" })
  user: User;

  @PrimaryColumn()
  recipeId: number;

  @PrimaryColumn()
  userId: number;

  @Column("boolean", { nullable: false })
  positiveRating: boolean;
}
