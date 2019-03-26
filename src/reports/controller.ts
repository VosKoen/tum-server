import {
  JsonController,
  Post,
  Param,
  NotFoundError,
  HttpCode
} from "routing-controllers";
import Recipe from "../recipes/entity";
import RecipeImage from '../recipe-images/entity'

@JsonController()
export default class ReportsController {
  @Post("/recipes/:id/reports")
  @HttpCode(201)
  async reportRecipe(@Param("id") id: number) {
    const recipe = await Recipe.findOne(id);
    if (!recipe) throw new NotFoundError("Recipe not found");
    recipe.addReportedCount();

    return {};
  }

  @Post("/images/:id/reports")
  @HttpCode(201)
  async reportImage(@Param("id") id: number) {
    const image = await RecipeImage.findOne(id);
    if (!image) throw new NotFoundError("Image not found");
    image.addReportedCount();

    return {};
  }
}
