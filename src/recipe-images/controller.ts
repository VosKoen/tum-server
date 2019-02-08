import {
  JsonController,
  Get,
  Param,
  UploadedFile,
  Post,
  Body,
  HttpCode,
  NotFoundError
} from "routing-controllers";
import { getRepository } from "typeorm";
import RecipeImage from "./entity";
import Recipe from '../recipes/entity'
import * as ImageKit from "imagekit";
import { imageKitId, publicApiKey, privateApiKey } from "../constants";

@JsonController()
export default class RecipeImageController {
  imagekit = new ImageKit({
    imagekitId: imageKitId,
    apiKey: publicApiKey,
    apiSecret: privateApiKey
  });

  @Get("/recipes/:id/images/random")
  async getRandomImage(@Param("id") id: number) {
    {
      try {
        const image: any = await getRepository(RecipeImage)
          .createQueryBuilder("recipeImage")
          .where("recipe_id = :id", { id: id })
          .orderBy("RANDOM()")
          .limit(1)
          .getOne();

        return image;
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }

  @Post("/images/upload")
  @HttpCode(201)
  async uploadNewImage(
    @UploadedFile("file")
    file: any,
    @Body() body: any
  ) {
    try {
      const imageBase64 = file.buffer.toString("base64");

      let image;

      await this.imagekit
        .upload(imageBase64, {
          filename: "some-test",
          folder: `user/${body.userId}`
        })
        .then(result => (image = result));

      return { imageUrl: image.url };
    } catch (error) {
      console.log(error);
    }
  }

  @Post("/recipes/:id/images/")
  @HttpCode(201)
  async addImageToRecipe(@Param("id") id: number, @Body() image: Partial<RecipeImage>) {
    try {
      const recipe = await Recipe.findOne(id);

      if (!recipe)
      throw new NotFoundError("Could not find a recipe with this id");
      const recipeImage = {recipeId: recipe.id, imageUrl: image.imageUrl}
      return RecipeImage.create(recipeImage).save()

    } catch (error) {
      console.log(error);
    }
  }

}
