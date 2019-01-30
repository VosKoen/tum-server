import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from "typeorm";
  import { BaseEntity } from "typeorm/repository/BaseEntity";
import Ingredient from "../ingredients/entity";
  
  @Entity()
  export default class IngredientAmountType extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number;
  
    @Column("text", { nullable: false })
    name: string;

    @OneToMany(_ => Ingredient, ingredient => ingredient.type)
    ingredients: Ingredient[];
  }