import {
  JsonController,
  Get,
  Param,
  Post,
  HttpCode,
  Body,
  NotFoundError,
  Authorized,
  UnauthorizedError,
  CurrentUser
} from "routing-controllers";
import Step from "./entity";
import Recipe from "../recipes/entity";
import User from "../users/entity";

@JsonController()
export default class RecipeStepController {
  @Get("/recipes/:id/steps")
  @Authorized()
  async getRecipeSteps(@Param("id") id: number) {
    const recipe = await Recipe.findOne(id);
    if (!recipe)
      throw new NotFoundError("Could not find a recipe with this id");
    const steps = await Step.find({ where: { recipeId: id } });

    return { steps };
  }

  @Post("/recipes/:id/steps")
  @Authorized()
  @HttpCode(201)
  async createRecipeStep(
    @Param("id") id: number,
    @Body() step: Partial<Step>,
    @CurrentUser() user: User
  ) {
    const recipe = await Recipe.findOne(id);
    if (!recipe)
      throw new NotFoundError("Could not find a recipe with this id");
    if (recipe.userId !== user.id)
      throw new UnauthorizedError("The recipe does not belong to the user");

    const newStep = Step.create({
      ...step,
      recipe
    });
    return newStep.save();
  }
}
