import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import IngredientType from "../ingredient-types/entity";

@Entity()
export default class Ingredient extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text", { nullable: false })
  name: string;

  @Column("text", { nullable: false })
  ingredientType: string;

  @ManyToOne(_ => IngredientType, type => type.ingredients)
  @JoinColumn({ name: "ingredient_type" })
  type: IngredientType;
}
