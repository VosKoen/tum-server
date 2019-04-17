import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";
import { Exclude } from "class-transformer";
import { MinLength, IsString, IsEmail } from "class-validator";
import * as bcrypt from "bcrypt";
import Recipe from "../recipes/entity";
import SelectedRecipe from "../selected-recipes/entity";
import RecipeUserRating from "../recipe-user-rating/entity";
import RequestedIngredient from "../requested-ingredients/entity";
import RecipeImage from "../recipe-images/entity";

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @IsEmail()
  @Column("text")
  email: string;

  @IsString()
  @MinLength(8)
  @Column("text")
  @Exclude({ toPlainOnly: true })
  password: string;

  async setPassword(rawPassword: string) {
    const hash = await bcrypt.hash(rawPassword, 8);
    this.password = hash;
  }

  checkPassword(rawPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, this.password);
  }

  @Column("text", { nullable: false })
  username: string;

  @Column("boolean", { nullable: false })
  isAdmin: boolean;

  @OneToMany(_ => Recipe, recipe => recipe.user)
  recipes: Recipe[];

  @OneToMany(_ => RecipeImage, recipeImage => recipeImage.user)
  recipeImages: RecipeImage[];

  @OneToMany(_ => SelectedRecipe, selectedRecipe => selectedRecipe.user)
  selectedRecipes: SelectedRecipe[];

  @OneToMany(_ => RecipeUserRating, recipeUserRating => recipeUserRating.user)
  recipeUserRatings: RecipeUserRating[];

  @OneToMany(
    _ => RequestedIngredient,
    requestedIngredient => requestedIngredient.user
  )
  requestedIngredients: RequestedIngredient[];
}
