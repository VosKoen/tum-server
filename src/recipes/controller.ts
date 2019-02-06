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

//Function to retrieve the ingredient details from the ingredient table. An outer join is not possible in TypeORM.
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

  // Function to retrieve a random recipe with all relevant details from the database
  @Get("/recipes/random")
  async getRandomRecipe() {
    {
      try {
        // Get a random recipe from the database
        const recipe: any = await getRepository(Recipe)
          .createQueryBuilder("recipe")
          .orderBy("RANDOM()")
          .limit(1)
          .getOne();

        // Retrieve the ingredients and steps belonging to this recipe  
        const completeRecipe = await getRepository(Recipe)
          .createQueryBuilder("recipe")
          .where("recipe.id = :id", { id: recipe.id })
          .leftJoinAndSelect("recipe.recipeIngredients", "ingredient")
          .leftJoinAndSelect("recipe.steps", "step")
          .getOne();

        // Retrieve the ingredient details which are stored in the ingredient table and not in the recipeIngredient table
        const ingredientDetails = await getIngredientDetails(completeRecipe);

        return { ...completeRecipe, ingredientDetails };
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }

  // Function to get all recipes created by a specific user
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
