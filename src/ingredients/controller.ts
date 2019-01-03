import {
  JsonController,
  Put,
  HttpCode,
  Body,
  Param
} from "routing-controllers";
import { getRepository } from "typeorm";
import Ingredient from "./entity";
import Recipe from "../recipes/entity";

@JsonController()
export default class RecipeIngredientController {
  @Put("/recipes/:id/ingredients")
  @HttpCode(201)
  async createRecipeIngredient(
    @Param("id") id: number,
    @Body() update: number[]
  ) {
    const recipe = await getRepository(Recipe).findOne(id);
    const ingredients = await getRepository(Ingredient).findByIds(update);

    const updateToMerge = {ingredients}
  
    if (recipe && updateToMerge) {
      return Recipe.merge(recipe, updateToMerge).save();
    }
  }
}
