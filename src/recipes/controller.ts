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
  Put,
  QueryParams
} from "routing-controllers";
import { getRepository, getConnection } from "typeorm";
import Recipe from "./entity";
import Ingredient from "../ingredients/entity";
import RecipeIngredient from "../recipe-ingredients/entity";
import Step from "../recipe-steps/entity";
import RecipeImage from "../recipe-images/entity";
import RecipeUserRating from "../recipe-user-rating/entity";

interface RecipeIngredientWithDetails {
  ingredientId: number;
  name: string;
  amount: string;
}

export interface Pagination {
  limit: number;
  offset: number;
}

export interface Filters {
  preparationTime?: string;
}

//Function to retrieve the ingredient details from the ingredient table. An outer join is not possible in TypeORM.
const getIngredientDetails = (completeRecipe: Recipe) => {
  const ingredientsWithDetails = completeRecipe.recipeIngredients.map(
    async ingredient => {
      const ingredientDetails = await getRepository(Ingredient)
        .createQueryBuilder("ingredient")
        .where("ingredient.id = :id", { id: ingredient.ingredientId })
        .getOne();
      if (!ingredientDetails)
        throw new InternalServerError("Something went wrong.");

      const ingredientObject: RecipeIngredientWithDetails = {
        ingredientId: ingredient.ingredientId,
        name: ingredientDetails.name,
        amount: ingredient.amount
      };

      return ingredientObject;
    }
  );
  return Promise.all(ingredientsWithDetails);
};

const getCompleteRecipe = async (recipeId: number) => {
  try {
    // Retrieve the ingredients and steps belonging to this recipe
    const completeRecipe = await getRepository(Recipe)
      .createQueryBuilder("recipe")
      .where("recipe.id = :id", { id: recipeId })
      .leftJoinAndSelect("recipe.recipeIngredients", "ingredient")
      .leftJoinAndSelect("recipe.steps", "step")
      .getOne();

    //Sort the steps by column order
    if (!completeRecipe) throw new NotFoundError("Recipe not found");

    completeRecipe.steps.sort((a, b) => a.order - b.order);

    // Retrieve the ingredient details which are stored in the ingredient table and not in the recipeIngredient table
    const ingredients = await getIngredientDetails(completeRecipe);

    if (completeRecipe) delete completeRecipe.recipeIngredients;

    return { ...completeRecipe, ingredients };
  } catch (e) {
    console.log(e);
    throw new InternalServerError("Something went wrong");
  }
};

@JsonController()
export default class RecipeController {
  // Function to retrieve a random recipe with all relevant details from the database
  @Get("/random-recipe")
  async getRandomRecipe(@QueryParams() queryInput: Filters) {

    try {

      const query = getRepository(Recipe).createQueryBuilder("recipe")

      //Filter on preparation time
      if(queryInput.preparationTime) query.andWhere('recipe.timeNeeded <= :preparationTime', {preparationTime: queryInput.preparationTime})

      // Get a random recipe from the database
      const recipe: any = await query
        .orderBy("RANDOM()")
        .limit(1)
        .getOne();
    
      //Get all relevant recipe information
      const completeRecipe = await getCompleteRecipe(recipe.id);
      return completeRecipe;
    } catch (error) {
      console.log(`An error occured: ${error}`);
      throw new InternalServerError("Something went wrong");
    }
  }

  @Get("/recipes/:id")
  async getRecipeById(@Param("id") id: number) {
    try {
      const completeRecipe = await getCompleteRecipe(id);
      return completeRecipe;
    } catch (error) {
      console.log(`An error occured: ${error}`);
      throw new InternalServerError("Something went wrong");
    }
  }

  // Function to get all recipes created by a specific user
  @Get("/users/:id/recipes")
  async getUserRecipes(
    @Param("id") id: number,
    @QueryParams() pagination: Pagination
  ) {
    
      try {
        const recipes = await Recipe.findAndCount({
          where: {
            userId: id
          },
          skip: pagination.offset,
          take: pagination.limit,
          order: {
            id: "DESC"
          }
        });

        return recipes;
      } catch (error) {
        console.log(`An error occured: ${error}`);
        throw new InternalServerError("Something went wrong");
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

    let isRatingResetRequired = false;
    //Steps
    if (update.steps) {
      update.steps.map((step, index) => {
        if (step.order !== index) isRatingResetRequired = true;
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
            isRatingResetRequired = true;
          } catch (error) {
            console.log(error);
          }
      });

      // Add new steps and change edited steps
      update.steps.map(async step => {
        if (!step.id) {
          try {
            isRatingResetRequired = true;
            const newStep = await Step.create({ ...step, recipe }).save();
            step.id = newStep.id;
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            const oldStep = oldSteps.find(oldStep => oldStep.id === step.id);

            if (oldStep) {
              if (oldStep.description !== step.description)
                isRatingResetRequired = true;
              Step.merge(oldStep, step).save();
            }
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
            isRatingResetRequired = true;
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
            isRatingResetRequired = true;

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
            if (oldIngredient) {
              if (oldIngredient.amount !== recipeIngredient.amount)
                isRatingResetRequired = true;
              RecipeIngredient.merge(oldIngredient, recipeIngredient).save();
            }
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
      update.recipeImages[0] &&
      images &&
      images[0] &&
      update.recipeImages[0].imageUrl !== images[0].imageUrl
    ) {
      try {
        RecipeImage.merge(images[0], update.recipeImages[0]).save();
      } catch (error) {
        console.log(error);
      }
    }

    const recipeMerge: Partial<Recipe> = {
      title: update.title,
      description: update.description,
      timeNeeded: update.timeNeeded,
      servings: update.servings
    };

    if (isRatingResetRequired) {
      recipeMerge.rating = 0;

      getConnection()
        .createQueryBuilder()
        .delete()
        .from(RecipeUserRating)
        .where("recipeId = :id", { id })
        .execute();
    }

    return await Recipe.merge(recipe, recipeMerge).save();
  }

  @Delete("/recipes/:id")
  @HttpCode(204)
  async deleteRecipe(@Param("id") id: number) {
    const recipe = await Recipe.findOne(id);
    if (!recipe) throw new NotFoundError("Could not find recipe");
    return Recipe.delete(recipe);
  }
}
