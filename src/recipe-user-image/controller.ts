import {
  JsonController,
  Param,
  Get,
  InternalServerError,
  Post,
  HttpCode,
  NotFoundError,
  UploadedFile
} from "routing-controllers";
import RecipeUserImage from "./entity";
import RecipeImage from "../recipe-images/entity";
import Recipe from '../recipes/entity'
import { transformImageUrl, uploadNewImage } from "../recipe-images/controller";
import * as cloudinary from "cloudinary";

@JsonController()
export default class RecipeUserImageController {
  @Get("/recipes/:recipeId/users/:userId/images")
  async getUserRecipeImages(
    @Param("userId") userId: number,
    @Param("recipeId") recipeId: number
  ) {
    const recipeUserImage = await RecipeUserImage.findOne({
      where: {
        recipeId,
        userId
      }
    });

    if (recipeUserImage) {
      const recipeImage = await RecipeImage.findOne(recipeUserImage.imageId);

      if (!recipeImage) throw new InternalServerError("Something went wrong");

      const imageUrl = transformImageUrl(recipeImage.imageUrl);
      return { imageUrl };
    }

    return { imageUrl: null };
  }

  @Post("/recipes/:id/users/:userId/images")
  @HttpCode(201)
  async addImageToRecipe(
    @Param("id") id: number,
    @Param("userId") userId: number,
    @UploadedFile("file") file: any
  ) {
    const response = await uploadNewImage(file);

    try {
      const recipe = await Recipe.findOne(id);

      if (!recipe)
        throw new NotFoundError("Could not find a recipe with this id");

      const newRecipeImage = {
        recipeId: recipe.id,
        userId: recipe.userId,
        imageUrl: response.imageUrl,
        publicId: response.publicId
      };

      const recipeImage = await RecipeImage.create(newRecipeImage).save();

      //See if an recipeUserImage already exists
      const oldRecipeUserImage = await RecipeUserImage.findOne({
        where: {
          userId: userId,
          recipeId: id
        }
      });

      if (!oldRecipeUserImage) {
        //Create new entry in RecipeUserImage
        const newRecipeUserImage = {
          recipeId: recipe.id,
          userId: recipe.userId,
          image: recipeImage
        };
        RecipeUserImage.create(newRecipeUserImage).save();
      } else {
        
        //Alter existing entry in RecipeUserImage and destroy old recipeImage
        const oldRecipeImage = await RecipeImage.findOne(
          oldRecipeUserImage.imageId
        );
        if (!oldRecipeImage)
          throw new InternalServerError("something went wrong");

        const updateRecipeUserImage = {
          image: recipeImage
        };
        await RecipeUserImage.merge(
          oldRecipeUserImage,
          updateRecipeUserImage
        ).save();

        const publicId = oldRecipeImage.publicId;

        await RecipeImage.delete(oldRecipeImage);
        cloudinary.v2.uploader.destroy(publicId, function(error, result) {
          console.log(result, error);
        });
      }

      const imageUrl = transformImageUrl(recipeImage.imageUrl);

      return { imageUrl };
    } catch (error) {
      console.log(error);
    }
  }
}
