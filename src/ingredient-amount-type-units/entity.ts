import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from "typeorm";
  import { BaseEntity } from "typeorm/repository/BaseEntity";
import IngredientAmountType from "../ingredient-amount-types/entity";
  
  @Entity()
  export default class IngredientAmountTypeUnits extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number;
  
    @Column("text", { nullable: false })
    name: string;

    @Column("text", { nullable: false })
    shorthand: string;

    @OneToMany(_ => IngredientAmountType, ingredientAmountType => ingredientAmountType.unit)
    ingredientAmountTypes: IngredientAmountType[];
  }