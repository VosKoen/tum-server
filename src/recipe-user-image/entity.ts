import { Entity, ManyToOne, Column, JoinColumn, PrimaryColumn, OneToOne } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import User from "../users/entity";
import Recipe from '../recipes/entity'
import RecipeImage from '../recipe-images/entity'

@Entity()
export default class RecipeUserImage extends BaseEntity {

  @ManyToOne(_ => Recipe, recipe => recipe.recipeUserRatings, {primary: true, onDelete:"CASCADE"})
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(_ => User, user => user.recipeUserRatings, {primary:true})
  @JoinColumn({ name: "user_id" })
  user: User;

  @PrimaryColumn()
  recipeId: number;

  @PrimaryColumn()
  userId: number;

  @Column("int", { nullable: false })
  imageId: number;

  @OneToOne(_ => RecipeImage, {nullable: false, onDelete:"CASCADE"})
  @JoinColumn({name: "image_id"})
  image: RecipeImage;
}
