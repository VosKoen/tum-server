import {
  JsonController,
  Get,
  Param,
  UploadedFile,
  Post,
  Put,
  HttpCode,
  NotFoundError
} from "routing-controllers";

import { getRepository } from "typeorm";
import RecipeImage from "./entity";
import Recipe from "../recipes/entity";
import * as cloudinary from "cloudinary";
import { imageFolder, imageTransformGradient } from "../constants";

const uploadNewImage = async file => {
  let cloudinaryReturn;
  try {
    const promise = new Promise((resolve, reject) =>
      cloudinary.v2.uploader
        .upload_stream(
          { resource_type: "image", folder: imageFolder },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        )
        .end(file.buffer)
    );

    await promise
      .then(res => (cloudinaryReturn = res))
      .catch(err => console.log(err));
  } catch (error) {
    console.log(error);
    return "An error occurred";
  }

  const imageUrl = cloudinaryReturn.secure_url;
  return imageUrl;
};

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

        if (!image) throw new NotFoundError("No image found");

        //Add tranform Cloudinary
        const regExp = new RegExp("/v[0-9]+/");
        image.imageUrl = image.imageUrl.replace(regExp, imageTransformGradient);

        return image;
      } catch (error) {
        console.log(`An error occured: ${error}`);
      }
    }
  }

  @Post("/recipes/:id/own-image")
  @HttpCode(201)
  async addImageToRecipe(
    @Param("id") id: number,
    @UploadedFile("file") file: any
  ) {
    const imageUrl = await uploadNewImage(file);

    try {
      const recipe = await Recipe.findOne(id);

      if (!recipe)
        throw new NotFoundError("Could not find a recipe with this id");

      const newRecipeImage = {
        recipeId: recipe.id,
        userId: recipe.userId,
        imageUrl
      };
      const recipeImage = await RecipeImage.create(newRecipeImage).save();

      //update ownRecipeImage on recipe
      const recipeUpdate = {
        ownImage: recipeImage
      };

      return Recipe.merge(recipe, recipeUpdate).save();
    } catch (error) {
      console.log(error);
    }
  }

  @Put("/recipes/:id/own-image")
  @HttpCode(201)
  async changeOwnRecipeImage(
    @Param("id") id: number,
    @UploadedFile("file") file: any
  ) {
    const imageUrl = await uploadNewImage(file);

    try {
      const recipe = await Recipe.findOne(id);

      if (!recipe)
        throw new NotFoundError("Could not find a recipe with this id");

      let oldOwnImage: RecipeImage | undefined;
      if (recipe.ownImageId) {
        oldOwnImage = await RecipeImage.findOne(recipe.ownImageId);
      }

      const newRecipeImage = {
        recipeId: recipe.id,
        userId: recipe.userId,
        imageUrl
      };
      const recipeImage = await RecipeImage.create(newRecipeImage).save();

      //update ownRecipeImage on recipe
      const recipeUpdate = {
        ownImage: recipeImage
      };

      const newRecipe = await Recipe.merge(recipe, recipeUpdate).save();

      if (oldOwnImage) await RecipeImage.delete(oldOwnImage);

      return newRecipe
    } catch (error) {
      console.log(error);
    }
  }
}
