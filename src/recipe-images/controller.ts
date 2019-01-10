import { JsonController, Get, Param } from "routing-controllers";
import { getRepository } from "typeorm";
import RecipeImage from "./entity";

@JsonController()
export default class RecipeImageController {
  @Get("/recipes/:id/images/random")
  async getRandomImage(@Param("id") id: number) {
    {
      try {
        const image: any = await getRepository(RecipeImage)
          .createQueryBuilder("recipeImage")
          .where("recipe_id = :id", {id: id})
          .orderBy("RANDOM()")
          .limit(1)
          .getOne();

        return image;
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }
}