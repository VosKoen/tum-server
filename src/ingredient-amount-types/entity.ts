import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn
  } from "typeorm";
  import { BaseEntity } from "typeorm/repository/BaseEntity";
import Ingredient from "../ingredients/entity";
import IngredientAmountTypeUnits from "../ingredient-amount-type-units/entity";
  
  @Entity()
  export default class IngredientAmountType extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number;
  
    @Column("text", { nullable: false })
    name: string;

    @Column("text", { nullable: true })
    units: string;

    @OneToMany(_ => Ingredient, ingredient => ingredient.type)
    ingredients: Ingredient[];

    @ManyToOne(_ => IngredientAmountTypeUnits, unit => unit.ingredientAmountTypes)
    @JoinColumn({ name: "units" })
    unit: IngredientAmountTypeUnits
    ;
  }