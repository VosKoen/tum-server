import {
  JsonController,
  Get,
  Post,
  HttpCode,
  Body,
  Param
} from "routing-controllers";
import { getRepository } from "typeorm";
import Recipe from "./entity";
import Ingredient from "../ingredients/entity";

const getIngredientDetails = completeRecipe => {
  const ingredientsWithDetails = completeRecipe.recipeIngredients.map(
    async ingredient => {
      const ingredientDetails = await getRepository(Ingredient)
        .createQueryBuilder("ingredient")
        .where("ingredient.id = :id", { id: ingredient.ingredientId })
        .getOne();
      return { ...ingredient, ...ingredientDetails };
    }
  );
  return Promise.all(ingredientsWithDetails);
};

@JsonController()
export default class RecipeController {
  @Get("/recipes/random")
  async getRandomRecipe() {
    {
      try {
        const recipe: any = await getRepository(Recipe)
          .createQueryBuilder("recipe")
          .orderBy("RANDOM()")
          .limit(1)
          .getOne();

        const completeRecipe = await getRepository(Recipe)
          .createQueryBuilder("recipe")
          .where("recipe.id = :id", { id: recipe.id })
          .leftJoinAndSelect("recipe.recipeIngredients", "ingredient")
          .leftJoinAndSelect("recipe.steps", "step")
          .getOne();

        const ingredientDetails = await getIngredientDetails(completeRecipe);

        return { ...completeRecipe, ingredientDetails };
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }

  @Get("/users/:id/recipes")
  async getUserRecipes(@Param("id") id: number) {
    {
      try {
        const recipes: any = await getRepository(Recipe)
          .createQueryBuilder("recipe")
          .where("recipe.userId = :id", { id: id })
          .getMany();

        return recipes;
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }

  @Post("/recipes")
  @HttpCode(201)
  async createRecipe(@Body() recipe: Recipe) {
    const newRecipe = Recipe.create(recipe);
    return newRecipe.save();
  }
}
