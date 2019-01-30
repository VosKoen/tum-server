import { createConnection } from "typeorm";
import { DefaultNamingStrategy } from "typeorm/naming-strategy/DefaultNamingStrategy";
import { NamingStrategyInterface } from "typeorm/naming-strategy/NamingStrategyInterface";
import { snakeCase } from "typeorm/util/StringUtils";
import Recipe from "./recipes/entity";
import Step from "./recipe-steps/entity";
import RecipeImage from "./recipe-images/entity";
import Ingredient from "./ingredients/entity";
import RecipeIngredient from "./recipe-ingredients/entity";
import IngredientType from "./ingredient-types/entity";
import IngredientAmountType from "./ingredient-amount-types/entity";
import User from "./users/entity";

class CustomNamingStrategy extends DefaultNamingStrategy
  implements NamingStrategyInterface {
  tableName(targetName: string, userSpecifiedName: string): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName);
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[]
  ): string {
    return snakeCase(
      embeddedPrefixes.concat(customName ? customName : propertyName).join("_")
    );
  }

  columnNameCustomized(customName: string): string {
    return customName;
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }
}

export default () =>
  createConnection({
    type: "postgres",
    url:
      process.env.DATABASE_URL ||
      "postgres://postgres:secret@localhost:5432/postgres",
    entities: [
      Recipe,
      Step,
      RecipeImage,
      Ingredient,
      RecipeIngredient,
      IngredientType,
      IngredientAmountType,
      User
    ],
    synchronize: true,
    logging: true,
    namingStrategy: new CustomNamingStrategy()
  }).then(_ => console.log("Connected to Postgres with TypeORM"));
