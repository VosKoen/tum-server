import {
  JsonController,
  Post,
  HttpCode,
  Param,
  Body,
  NotFoundError
} from "routing-controllers";
import RecipeIngredient from "./entity";
import Recipe from "../recipes/entity";
import Ingredient from "../ingredients/entity";

@JsonController()
export default class RecipeIngredientController {
  @Post("/recipes/:recipeId/ingredients/:ingredientId")
  @HttpCode(201)
  async createRecipeIngredient(
    @Param("recipeId") recipeId: number,
    @Param("ingredientId") ingredientId: number,
    @Body() recipeIngredientBody: Partial<RecipeIngredient>
  ) {
    const recipe = await Recipe.findOne(recipeId);
    const ingredient = await Ingredient.findOne(ingredientId);

    if (!recipe)
      throw new NotFoundError("Could not find a recipe with this id");

    if (!ingredient)
      throw new NotFoundError("Could not find an ingredient with this id");

    const recipeIngredient = { recipe, ingredient, ...recipeIngredientBody };

    const newRecipeIngredient = RecipeIngredient.create(recipeIngredient);
    return newRecipeIngredient.save();
  }
}
