import {
    JsonController,
    Post,
    HttpCode,
    Body,
    Authorized
  } from "routing-controllers";
  import RequestedIngredient from "./entity";

  
  @JsonController()
  export default class RequestedIngredientController {
  
    @Post("/requested-ingredients")
    @HttpCode(201)
    @Authorized()
    async createRequestForIngredient( @Body() requestedIngredient: Partial<RequestedIngredient>) {

      return RequestedIngredient.create(requestedIngredient).save();
    }
  }
  