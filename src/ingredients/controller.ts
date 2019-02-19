import { JsonController, Get } from "routing-controllers";
import Ingredient from "./entity";

@JsonController()
export default class IngredientController {
  @Get("/ingredients")
  async getListOfIngredients() {
    {
      try {
        return Ingredient.find();
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }
}
