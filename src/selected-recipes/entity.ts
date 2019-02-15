import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import User from "../users/entity";
import Recipe from "../recipes/entity";

@Entity()
export default class SelectedRecipe extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("bigint", { nullable: false })
  selectedTimestamp: number;

  @Column("int", { nullable: false })
  recipeId: number;

  @Column("int", { nullable: false })
  userId: number;

  @ManyToOne(_ => User, user => user.selectedRecipes)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(_ => Recipe, recipe => recipe.selectedRecipes)
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;
}
