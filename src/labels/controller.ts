import { JsonController, Get, Authorized } from "routing-controllers";
import Label from "./entity";

@JsonController()
export default class LabelController {
  @Get("/labels")
  @Authorized()
  getListOfLabels() {
    {

      try {
        return Label.find();
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }
  
}
