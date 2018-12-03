import { JsonController, Get } from "routing-controllers";
import { getRepository } from "typeorm";
import Recipe from "./entity";

@JsonController()
export default class RecipeController {
  @Get("/recipes/random")
  async getRandomRecipe() {
    {
      try {
        const recipe = await getRepository(Recipe)
          .createQueryBuilder("recipe")
          .orderBy("RANDOM()")
          .limit(1)
          .getOne();

        return recipe;
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }
}
