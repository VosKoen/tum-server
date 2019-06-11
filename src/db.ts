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
import User from "./users/entity";
import SelectedRecipe from "./selected-recipes/entity";
import RecipeUserRating from "./recipe-user-rating/entity";
import RequestedIngredient from "./requested-ingredients/entity";
import RecipeUserImage from "./recipe-user-image/entity";
import Label from "./labels/entity";
import RecipeLabel from "./recipe-labels/entity";
import UserFollow from "./user-follows/entity";

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
      User,
      SelectedRecipe,
      RecipeUserRating,
      RequestedIngredient,
      RecipeUserImage,
      Label,
      RecipeLabel,
      UserFollow
    ],
    synchronize: true,
    logging: true,
    namingStrategy: new CustomNamingStrategy()
  }).then(_ => console.log("Connected to Postgres with TypeORM"));
