import {
    JsonController,
    Post,
    HttpCode,
    Body,
  } from "routing-controllers";
  import RequestedIngredient from "./entity";

  
  @JsonController()
  export default class RequestedIngredientController {
  
    @Post("/requested-ingredients")
    @HttpCode(201)
    async createRequestForIngredient( @Body() requestedIngredient: Partial<RequestedIngredient>) {

      return RequestedIngredient.create(requestedIngredient).save();
    }
  }
  