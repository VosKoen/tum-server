import {
  JsonController,
  Get,
  Post,
  HttpCode,
  Body,
  Param,
  Delete,
  NotFoundError,
  InternalServerError
} from "routing-controllers";
import { getRepository } from "typeorm";
import Recipe from "./entity";
import Ingredient from "../ingredients/entity";

interface recipeIngredientWithDetails {
  id: number;
  name: string;
  amountType: number;
  amountNumber: number;
  unit?: string;
}

//Function to retrieve the ingredient details from the ingredient table. An outer join is not possible in TypeORM.
const getIngredientDetails = completeRecipe => {
  const ingredientsWithDetails = completeRecipe.recipeIngredients.map(
    async ingredient => {
      const ingredientDetails = await getRepository(Ingredient)
        .createQueryBuilder("ingredient")
        .where("ingredient.id = :id", { id: ingredient.ingredientId })
        .getOne();
      if (!ingredientDetails)
        throw new InternalServerError("Something went wrong on the server.");

      const ingredients: recipeIngredientWithDetails = {
        id: ingredient.ingredientId,
        name: ingredientDetails.name,
        amountType: ingredient.amountType,
        amountNumber: ingredient.amount
      };
      return ingredients;
    }
  );
  return Promise.all(ingredientsWithDetails);
};

@JsonController()
export default class RecipeController {
  // Function to retrieve a random recipe with all relevant details from the database
  @Get("/random-recipe")
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
        const ingredients = await getIngredientDetails(completeRecipe);


        if(completeRecipe)
        delete completeRecipe.recipeIngredients;

        return { ...completeRecipe, ingredients };
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }

  @Get("/recipes/:id")
  async getRecipeById(@Param("id") id: number) {
    {
      try {
        const recipe = await Recipe.findOne(id);
        if (!recipe) throw new NotFoundError("Could not find recipe");

        // Retrieve the ingredients and steps belonging to this recipe
        const completeRecipe = await getRepository(Recipe)
          .createQueryBuilder("recipe")
          .where("recipe.id = :id", { id: recipe.id })
          .leftJoinAndSelect("recipe.recipeIngredients", "ingredient")
          .leftJoinAndSelect("recipe.steps", "step")
          .getOne();

        // Retrieve the ingredient details which are stored in the ingredient table and not in the recipeIngredient table
        const ingredients = await getIngredientDetails(completeRecipe);

        if(completeRecipe)
        delete completeRecipe.recipeIngredients;

        return { ...completeRecipe, ingredients };
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

  @Delete("/recipes/:id")
  @HttpCode(204)
  async deleteRecipe(@Param("id") id: number) {
    const recipe = await Recipe.findOne(id);
    if (!recipe) throw new NotFoundError("Could not find recipe");
    return Recipe.delete(recipe);
  }
}
