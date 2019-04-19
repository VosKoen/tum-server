import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import RecipeLabel from '../recipe-labels/entity'

@Entity()
export default class Label extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text", { nullable: false })
  labelName: string;

  @OneToMany(_ => RecipeLabel, recipeLabel => recipeLabel.label)
  recipeLabels: RecipeLabel[];
}