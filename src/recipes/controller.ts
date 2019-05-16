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
  QueryParams,
  Authorized,
  CurrentUser,
  UnauthorizedError
} from "routing-controllers";
import { getRepository, getConnection } from "typeorm";
import Recipe from "./entity";
import Ingredient from "../ingredients/entity";
import RecipeIngredient from "../recipe-ingredients/entity";
import Step from "../recipe-steps/entity";
import RecipeUserRating from "../recipe-user-rating/entity";
import User from "../users/entity";
import Label from "../labels/entity";
import RecipeLabel from "../recipe-labels/entity";

interface RecipeIngredientWithDetails {
  ingredientId: number;
  name: string;
  amount: string;
}

interface RecipeLabelWithDetails {
  labelId: number;
  labelName: string;
}

export interface Pagination {
  limit: number;
  offset: number;
}

export interface Filters {
  preparationTime?: string;
  vegetarian?: string;
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

//Function to retrieve the label details from the label table. An outer join is not possible in TypeORM.
const getLabelDetails = (completeRecipe: Recipe) => {
  const labelsWithDetails = completeRecipe.recipeLabels.map(async label => {
    const labelDetails = await getRepository(Label)
      .createQueryBuilder("label")
      .where("label.id = :id", { id: label.labelId })
      .getOne();
    if (!labelDetails) throw new InternalServerError("Something went wrong.");

    const labelObject: RecipeLabelWithDetails = {
      labelId: label.labelId,
      labelName: labelDetails.labelName
    };

    return labelObject;
  });
  return Promise.all(labelsWithDetails);
};

const getCompleteRecipe = async (recipeId: number) => {
  try {
    // Retrieve the ingredients and steps belonging to this recipe
    const completeRecipe = await getRepository(Recipe)
      .createQueryBuilder("recipe")
      .where("recipe.id = :id", { id: recipeId })
      .leftJoinAndSelect("recipe.recipeIngredients", "ingredient")
      .leftJoinAndSelect("recipe.steps", "step")
      .leftJoinAndSelect("recipe.recipeLabels", "label")
      .getOne();

    //Sort the steps by column order
    if (!completeRecipe) throw new NotFoundError("Recipe not found");

    completeRecipe.steps.sort((a, b) => a.order - b.order);

    // Retrieve the ingredient details which are stored in the ingredient table and not in the recipeIngredient table
    const ingredients = await getIngredientDetails(completeRecipe);
    const labels = await getLabelDetails(completeRecipe);

    delete completeRecipe.recipeIngredients;
    delete completeRecipe.recipeLabels;

    //Retrieve userdetails
    const user = await User.findOne(completeRecipe.userId);
    if (!user) throw new InternalServerError("Empty user reference");

    //If username is to be hidden, do not return it
    if (user.hideUsername)
      return { ...completeRecipe, ingredients, labels, username: "" };

    //Else return including username
    return { ...completeRecipe, ingredients, labels, username: user.username };
  } catch (e) {
    console.log(e);
    throw new InternalServerError("Something went wrong");
  }
};

@JsonController()
export default class RecipeController {
  // Function to retrieve a random recipe with all relevant details from the database
  @Get("/random-recipe")
  @Authorized()
  async getRandomRecipe(@QueryParams() queryInput: Filters) {
    try {
      const query = getRepository(Recipe).createQueryBuilder("recipe");

      const { preparationTime, vegetarian, ...queryLabels } = queryInput;
      //Filter on preparation time
      if (preparationTime)
        query.andWhere("recipe.timeNeeded <= :preparationTime", {
          preparationTime: preparationTime
        });

      if (Object.keys(queryLabels).length > 0) {
        const allLabels = await Label.find();
        if (!allLabels) throw new InternalServerError("Something went wrong");

        //OR query
        const labelIdsOrQuery = Object.keys(queryLabels)
          .map(queriedLabel => {
            const labelObject = allLabels.find(
              label => queriedLabel === label.labelName
            );
            if (!labelObject) return undefined;
            return labelObject.id;
          })
          .filter(resultingId => resultingId);

        if (labelIdsOrQuery.length > 0) {
          console.log(labelIdsOrQuery);
          const queryStringParts = labelIdsOrQuery.map(
            id => `recipeLabel.labelId = ${id}`
          );
          const queryStringOr = `(${queryStringParts.join(" OR ")})`;
          query
            .innerJoin("recipe.recipeLabels", "recipeLabel")
            .andWhere(queryStringOr);
        }

        //AND query
        const labelIdsAndQuery = Object.keys(queryLabels)
          .map(queriedLabel => {
            const labelObject = allLabels.find(
              label => queriedLabel === `${label.labelName}AndCondition`
            );
            if (!labelObject) return undefined;
            return labelObject.id;
          })
          .filter(resultingId => resultingId);

        if (labelIdsAndQuery.length > 0) {
          labelIdsAndQuery.map(id =>
            query.innerJoin(
              "recipe.recipeLabels",
              `recipeLabel${id}`,
              `recipeLabel${id}.labelId = ${id}`
            )
          );
        }
      }

      // Get a random recipe from the database
      const recipe: any = await query
        .orderBy("RANDOM()")
        .limit(1)
        .getOne();

      if (!recipe) throw new NotFoundError("No recipe found");

      recipe.addUserRandomViewsCount();

      //Get all relevant recipe information
      const completeRecipe = await getCompleteRecipe(recipe.id);
      return completeRecipe;
    } catch (error) {
      console.log(`An error occured: ${error}`);
      // throw new InternalServerError("Something went wrong");
    }
  }

  @Get("/recipes/:id")
  @Authorized()
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
  @Authorized()
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
  @Authorized()
  @HttpCode(201)
  async createRecipe(@Body() recipe: Recipe, @CurrentUser() user: User) {
    const newRecipe = await Recipe.create({
      ...recipe,
      userId: user.id
    }).save();

    //Add labels
    recipe.recipeLabels.map(async recipeLabel => {
      const label = await Label.findOne(recipeLabel.labelId);
      const recipe = await Recipe.findOne(newRecipe.id);
      return RecipeLabel.create({ recipe, label }).save();
    });

    return { ...newRecipe, recipeLabels: [...recipe.recipeLabels] };
  }

  @Put("/recipes/:id")
  @Authorized()
  async changeExistingRecipe(
    @Param("id") id: number,
    @Body() update: Partial<Recipe>,
    @CurrentUser() user: User
  ) {
    const recipe = await Recipe.findOne(id);
    if (!recipe) throw new NotFoundError("Could not find recipe");
    if (recipe.userId !== user.id)
      throw new UnauthorizedError(
        "This recipe does not belong to the authenticated user"
      );

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

    //Labels
    if (update.recipeLabels) {
      update.recipeLabels.map(label => {
        label.recipeId = id;
      });

      //Remove deleted recipe-labels
      const oldLabels = await RecipeLabel.find({
        where: { recipeId: id }
      });
      oldLabels.map(async oldLabel => {
        if (
          update.recipeLabels &&
          !update.recipeLabels.find(
            newLabel => oldLabel.labelId === newLabel.labelId
          )
        )
          try {
            await RecipeLabel.delete(oldLabel);
          } catch (error) {
            console.log(error);
          }
      });

      // Add new recipe-labels
      update.recipeLabels.map(async recipeLabel => {
        if (
          !oldLabels.find(oldLabel => oldLabel.labelId === recipeLabel.labelId)
        ) {
          try {
            const label = await Label.findOne(recipeLabel.labelId);

            await RecipeLabel.create({
              recipe,
              label
            }).save();
          } catch (error) {
            console.log(error);
          }
        }
      });
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
  @Authorized()
  @HttpCode(204)
  async deleteRecipe(@Param("id") id: number, @CurrentUser() user: User) {
    const recipe = await Recipe.findOne(id);
    if (!recipe) throw new NotFoundError("Could not find recipe");
    if (recipe.userId !== user.id)
      throw new UnauthorizedError(
        "This recipe does not belong to the authenticated user"
      );

    return Recipe.delete(recipe);
  }
}
