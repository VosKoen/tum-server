import {
  JsonController,
  Get,
  Post,
  HttpCode,
  Body,
  Param,
  Delete,
  NotFoundError,
  InternalServerError,
  Put
} from "routing-controllers";
import { getRepository } from "typeorm";
import Recipe from "./entity";
import Ingredient from "../ingredients/entity";
import RecipeIngredient from "../recipe-ingredients/entity";
import Step from "../recipe-steps/entity";
import RecipeImage from "../recipe-images/entity";

interface recipeIngredientWithDetails {
  ingredientId: number;
  name: string;
  amountType: number;
  amountNumber: number;
  amountTypeUnit?: string;
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
        ingredientId: ingredient.ingredientId,
        name: ingredientDetails.name,
        amountType: ingredient.amountType,
        amountNumber: ingredient.amountNumber,
        amountTypeUnit: ingredient.amountTypeUnit
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

        //Sort the steps by column order
        if (completeRecipe)
          completeRecipe.steps.sort((a, b) => a.order - b.order);

        // Retrieve the ingredient details which are stored in the ingredient table and not in the recipeIngredient table
        const ingredients = await getIngredientDetails(completeRecipe);

        if (completeRecipe) delete completeRecipe.recipeIngredients;

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

        //Sort the steps by column order
        if (completeRecipe)
          completeRecipe.steps.sort((a, b) => a.order - b.order);

        // Retrieve the ingredient details which are stored in the ingredient table and not in the recipeIngredient table
        const ingredients = await getIngredientDetails(completeRecipe);

        if (completeRecipe) delete completeRecipe.recipeIngredients;

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

  @Put("/recipes/:id")
  async changeExistingRecipe(
    @Param("id") id: number,
    @Body() update: Partial<Recipe>
  ) {
    const recipe = await Recipe.findOne(id);
    if (!recipe) throw new NotFoundError("Could not find recipe");

    //Steps
    if (update.steps) {
      update.steps.map((step, index) => {
        step.order = index;
        step.recipeId = id;
      });

      //Remove deleted steps
      const oldSteps = await Step.find({ where: { recipeId: id } });
      oldSteps.map(async oldStep => {
        if (
          update.steps &&
          !update.steps.find(newStep => oldStep.id === newStep.id)
        )
          try {
            await Step.delete(oldStep);
          } catch (error) {
            console.log(error);
          }
      });

      // Add new steps and change edited steps
      update.steps.map(async step => {
        if (!step.id) {
          try {
            const newStep = await Step.create({ ...step, recipe }).save();
            step.id = newStep.id;
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            const oldStep = oldSteps.find(oldStep => oldStep.id === step.id);
            if (oldStep) Step.merge(oldStep, step).save();
          } catch (error) {
            console.log(error);
          }
        }
      });
    }

    //Ingredients
    if (update.recipeIngredients) {
      update.recipeIngredients.map(ingredient => {
        ingredient.recipeId = id;
      });

      //Remove deleted recipe-ingredients
      const oldIngredients = await RecipeIngredient.find({
        where: { recipeId: id }
      });
      oldIngredients.map(async oldIngredient => {
        if (
          update.recipeIngredients &&
          !update.recipeIngredients.find(
            newIngredient =>
              oldIngredient.ingredientId === newIngredient.ingredientId
          )
        )
          try {
            await RecipeIngredient.delete(oldIngredient);
          } catch (error) {
            console.log(error);
          }
      });
      // Add new recipe-ingredients and change edited recipe-ingredients
      update.recipeIngredients.map(async recipeIngredient => {
        if (
          !oldIngredients.find(
            oldIngredient =>
              oldIngredient.ingredientId === recipeIngredient.ingredientId
          )
        ) {
          try {
            const ingredient = await Ingredient.findOne(
              recipeIngredient.ingredientId
            );
            await RecipeIngredient.create({
              recipe,
              ingredient,
              ...recipeIngredient
            }).save();
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            const oldIngredient = oldIngredients.find(
              oldIngredient =>
                oldIngredient.ingredientId === recipeIngredient.ingredientId
            );
            if (oldIngredient)
              RecipeIngredient.merge(oldIngredient, recipeIngredient).save();
          } catch (error) {
            console.log(error);
          }
        }
      });
    }

    //Images, check if changed and if changed submit new image
    // update.imageUrl

    const images = await RecipeImage.find({ where: { recipeId: id } });

    if (
      update.recipeImages &&
      images &&
      update.recipeImages[0].imageUrl !== images[0].imageUrl
    ) try {
      RecipeImage.merge(images[0], update.recipeImages[0]).save();
    }
    catch(error) {
      console.log(error)
    }

    const recipeMerge = {
      title: update.title,
      description: update.description
    };

    return Recipe.merge(recipe, recipeMerge).save();
  }

  @Delete("/recipes/:id")
  @HttpCode(204)
  async deleteRecipe(@Param("id") id: number) {
    const recipe = await Recipe.findOne(id);
    if (!recipe) throw new NotFoundError("Could not find recipe");
    return Recipe.delete(recipe);
  }
}
