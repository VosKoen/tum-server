import {
  JsonController,
  Param,
  Post,
  HttpCode,
  Get,
  QueryParams,
  Authorized,
  CurrentUser,
  UnauthorizedError,
  NotFoundError
} from "routing-controllers";
import User from "../users/entity";
import Recipe from "../recipes/entity";
import SelectedRecipe from "../selected-recipes/entity";
import { getRepository } from "typeorm";
import { Pagination } from "../recipes/controller";

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
  @Authorized()
  async createRecipeSelected(
    @Param("userId") userId: number,
    @Param("recipeId") recipeId: number,
    @CurrentUser() user: User
  ) {
    if (user.id !== userId)
      throw new UnauthorizedError("No authorization for the provided user id");

    const recipe = await Recipe.findOne(recipeId);
    if(!recipe) throw new NotFoundError("Recipe not found")

    const selectedTimestamp = new Date().getTime();

    return SelectedRecipe.create({
      recipe,
      user,
      selectedTimestamp
    }).save();
  }

  @Get("/users/:userId/selected-recipes")
  @Authorized()
  async getRecipeHistory(
    @Param("userId") userId: number,
    @QueryParams() pagination: Pagination,
    @CurrentUser() user: User
  ) {
    if (user.id !== userId)
    throw new UnauthorizedError("No authorization for the provided user id");
    try {
      const history = await getRepository(SelectedRecipe)
        .createQueryBuilder("selectedRecipe")
        .innerJoinAndSelect("selectedRecipe.recipe", "recipe")
        .where("selectedRecipe.userId = :userId", { userId })
        .orderBy("selectedRecipe.selectedTimestamp", "DESC")
        .limit(pagination.limit)
        .offset(pagination.offset)
        .getManyAndCount();

      const recipes = history[0];
      const count = history[1];

      if (history) {
        const recipeHistory: RecipeHistory = recipes.map(item => {
          const historyItem: RecipeHistoryEntry = {
            recipeId: item.recipeId,
            title: item.recipe.title,
            timeSelected: item.selectedTimestamp
          };
          return historyItem;
        });
        return [recipeHistory, count];
      }
      return [[], null];
    } catch (error) {
      console.log(error);
      throw new Error(
        "Something went wrong retrieving your cooked recipe history"
      );
    }
  }
}
