import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import Step from "../recipe-steps/entity";
import RecipeImage from '../recipe-images/entity'
import RecipeIngredient from "../recipe-ingredients/entity";
import User from '../users/entity'

@Entity()
export default class Recipe extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text", { nullable: false })
  title: string;

  @Column("text", { nullable: false })
  description: string;

  @Column("int", { nullable: false })
  userId: number;

  @OneToMany(_ => Step, step => step.recipe)
  steps: Step[];

  @OneToMany(_ => RecipeImage, recipeImage => recipeImage.recipe)
  recipeImages: RecipeImage[];

  @OneToMany(_ => RecipeIngredient, recipeIngredient => recipeIngredient.recipe)
  recipeIngredients: RecipeIngredient[];

  @ManyToOne(_ => User, user => user.recipes)
  @JoinColumn({ name: "user_id" })
  user: User;
}
