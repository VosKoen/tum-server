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
import Recipe from "../recipes/entity";
import * as cloudinary from "cloudinary";
import {imageFolder} from "../constants"

@JsonController()
export default class RecipeImageController {
  @Get("/recipes/:id/images/random")
  async getRandomImage(@Param("id") id: number) {
    {
      try {
        const image = await getRepository(RecipeImage)
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
    file: Buffer
  ) {

    let returnData;

    try {
      const promise = new Promise((resolve, reject) =>
        cloudinary.v2.uploader
          .upload_stream({ resource_type: "image", folder: imageFolder }, (error, result) => {
            if (error) reject(error);
            resolve(result);
          })
          .end(file.buffer)
      );

      await promise
        .then(res => (returnData = res))
        .catch(err => console.log(err));
    } catch (error) {
      console.log(error);
      return "An error occurred";
    }

    return { imageUrl: returnData.secure_url };
  }

  @Post("/recipes/:id/images/")
  @HttpCode(201)
  async addImageToRecipe(
    @Param("id") id: number,
    @Body() image: Partial<RecipeImage>
  ) {
    try {
      const recipe = await Recipe.findOne(id);

      if (!recipe)
        throw new NotFoundError("Could not find a recipe with this id");
      const recipeImage = { recipeId: recipe.id, imageUrl: image.imageUrl };
      return RecipeImage.create(recipeImage).save();
    } catch (error) {
      console.log(error);
    }
  }
}
