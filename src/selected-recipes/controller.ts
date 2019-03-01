import {
  JsonController,
  Param,
  Post,
  HttpCode,
  Get
} from "routing-controllers";
import User from "../users/entity";
import Recipe from "../recipes/entity";
import SelectedRecipe from "../selected-recipes/entity";
import { getRepository } from "typeorm";

interface RecipeHistoryEntry {
  recipeId: SelectedRecipe["recipeId"];
  title: Recipe["title"];
  timeSelected: SelectedRecipe["selectedTimestamp"];
}

interface RecipeHistory extends Array<RecipeHistoryEntry> {}

@JsonController()
export default class SelectedRecipeController {
  @Post("/users/:userId/recipes/:recipeId/selected-recipes")
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

  @Get("/users/:userId/selected-recipes")
  async getRecipeHistory(@Param("userId") userId: number) {
    try {
      const history = await getRepository(SelectedRecipe)
        .createQueryBuilder("selectedRecipe")
        .innerJoinAndSelect("selectedRecipe.recipe", "recipe")
        .where("selectedRecipe.userId = :userId", { userId })
        .getMany();

      if (history) {
        const recipeHistory: RecipeHistory = history.map(item => {
          const historyItem: RecipeHistoryEntry = {
            recipeId: item.recipeId,
            title: item.recipe.title,
            timeSelected: item.selectedTimestamp
          };
          return historyItem;
        });
        return recipeHistory;
      }
      return [];
    } catch (error) {
      console.log(error);
      throw new Error(
        "Something went wrong retrieving your cooked recipe history"
      );
    }
  }
}
