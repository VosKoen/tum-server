import {
  JsonController,
  Post,
  HttpCode,
  Body,
  Param,
  NotFoundError,
  ForbiddenError,
  Get
} from "routing-controllers";
import Recipe from "../recipes/entity";
import User from "../users/entity";
import RecipeUserRating from "./entity";

@JsonController()
export default class RecipeUserRatingController {
  @Get("/recipes/:recipeId/users/:userId/ratings")
  async getUserRecipes(
    @Param("userId") userId: number,
    @Param("recipeId") recipeId: number
  ) {
    const recipeUserRating = await RecipeUserRating.findOne({
      where: {
        recipeId,
        userId
      }
    });

    const recipe = await Recipe.findOne(recipeId)
    if(!recipe) throw new NotFoundError(`No recipe found with id ${recipeId}`)

    if(recipeUserRating) return {recipeIsLiked: recipeUserRating.recipeIsLiked, newRating: recipe.rating}

    return {recipeIsLiked: null, newRating: recipe.rating}

  }

  @Post("/recipes/:recipeId/users/:userId/ratings")
  @HttpCode(201)
  async setRecipeUserRating(
    @Param("userId") userId: number,
    @Param("recipeId") recipeId: number,
    @Body() body: { recipeIsLiked: boolean }
  ) {
    const recipeUserRating = await RecipeUserRating.findOne({
      where: {
        recipeId,
        userId
      }
    });
    const recipe = await Recipe.findOne(recipeId);
    const user = await User.findOne(userId);

    if (!recipe)
      throw new NotFoundError("Could not find a recipe with this id");

    if (!user) throw new NotFoundError("Could not find a user with this id");

    const oldRating = recipe.rating ? recipe.rating : 0;

    let firstRating = false;

    if (!recipeUserRating) {
      RecipeUserRating.create({
        recipe,
        user,
        recipeIsLiked: body.recipeIsLiked
      }).save();
      firstRating = true;
    }

    if (recipeUserRating) {
      if (body.recipeIsLiked === recipeUserRating.recipeIsLiked)
        throw new ForbiddenError("The requested rating is already set as such");

      RecipeUserRating.merge(recipeUserRating, {
        recipeIsLiked: body.recipeIsLiked
      }).save();
    }
    let increment = 2;
    if (firstRating) increment = 1;
    const newRating = body.recipeIsLiked
      ? oldRating + increment
      : oldRating - increment;
    return {
      recipe: Recipe.merge(recipe, { rating: newRating }).save(),
      recipeIsLiked: body.recipeIsLiked,
      newRating
    };
  }
}
