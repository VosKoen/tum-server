import { Entity, JoinColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import User from "../users/entity";

@Entity()
export default class UserFollow extends BaseEntity {
  @ManyToOne(_ => User, user => user.chefsFollowed, {
    primary: true,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "head_chef_id" })
  headChef: User;

  @ManyToOne(_ => User, user => user.followers, {
    primary: true,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "sous_chef_id" })
  sousChef: User;

  @PrimaryColumn()
  headChefId: number;

  @PrimaryColumn()
  sousChefId: number;
}
