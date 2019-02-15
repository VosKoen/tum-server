import { JsonController, Param, Post, HttpCode } from "routing-controllers";
import User from "../users/entity";
import Recipe from "../recipes/entity";
import SelectedRecipe from "../selected-recipes/entity";

@JsonController()
export default class SelectedRecipeController {
  @Post("/users/:userId/recipes/:recipeId")
  @HttpCode(201)
  async createRecipeSelected(
    @Param("userId") userId: number,
    @Param("recipeId") recipeId: number
  ) {
    const recipe = await Recipe.findOne(recipeId);
    const user = await User.findOne(userId);

    const selectedTimestamp = new Date().getTime();

    return SelectedRecipe.create({
      recipe,
      user,
      selectedTimestamp
    }).save();
  }
}
