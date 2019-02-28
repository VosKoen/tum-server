import { JsonController, Get } from "routing-controllers";
import IngredientAmountType from "./entity";

@JsonController()
export default class IngredientAmountTypeController {
  @Get("/ingredientAmountTypes")
  getListOfIngredientAmountTypes() {
    {
      try {
        return IngredientAmountType.find();
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }
  
}
