import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import Recipe from '../recipes/entity'
import User from '../users/entity'

@Entity()
export default class RecipeImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text", { nullable: false })
  imageUrl: string;

  @Column("text", { nullable: false })
  publicId: string;

  @Column("decimal", { nullable: true })
  conversionRate: number;

  @Column("int", { nullable: false })
  recipeId: number;

  @Column("int", { nullable: false })
  userId: number;

  @ManyToOne(_ => Recipe, recipe => recipe.recipeImages,{onDelete:"CASCADE"})
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(_ => User, user => user.recipes)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToOne(_ => Recipe)
  ownImageRecipe: Recipe;

}