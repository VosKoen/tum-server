import {
  JsonController,
  Get,
  Param,
  UploadedFile,
  Post,
  Body
} from "routing-controllers";
import { getRepository } from "typeorm";
import RecipeImage from "./entity";
import * as ImageKit from 'imagekit'
import {imageKitId, publicApiKey, privateApiKey} from '../constants'


@JsonController()
export default class RecipeImageController {
  imagekit = new ImageKit({
    "imagekitId" : imageKitId,       
    "apiKey" : publicApiKey,       
    "apiSecret" : privateApiKey, 
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
  async uploadNewImage(
    @UploadedFile("file", 
    ) file: any, @Body() body: any
  ) 
  {
    
    
    try {
      const imageBase64 = file.buffer.toString('base64')
      await this.imagekit.upload(imageBase64, {
        "filename" : "some-test",
        "folder" : "another-test"
      })

      console.log(body)
      

    } catch (error) {
      console.log(error);
    }
    return {
      imageUrl:
        "https://ik.imagekit.io/foxAppDevImages/spaghetti-carbonara_rkLaQdhf4.jpg"
    };
  }
}
