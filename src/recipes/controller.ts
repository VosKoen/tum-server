import { JsonController, Get, Post, HttpCode, Body } from "routing-controllers";
import { getRepository } from "typeorm";
import Recipe from "./entity";

@JsonController()
export default class RecipeController {
  @Get("/recipes/random")
  async getRandomRecipe() {
    {
      try {
        const recipe:any = await getRepository(Recipe)
          .createQueryBuilder("recipe")
          .orderBy("RANDOM()")
          .limit(1)
          .getOne()


        const recipeWithIngredients = await getRepository(Recipe)
        .createQueryBuilder("recipe")
        .where("recipe.id = :id", {id: recipe.id} )
        .leftJoinAndSelect("recipe.ingredients", "ingredient")
        .getOne();

        return recipeWithIngredients;
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
