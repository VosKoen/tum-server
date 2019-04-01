import { JsonController, Get, Authorized } from "routing-controllers";
import Ingredient from "./entity";

@JsonController()
export default class IngredientController {
  @Get("/ingredients")
  @Authorized()
  getListOfIngredients() {
    {

      try {
        return Ingredient.find();
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }
  
}
