import "reflect-metadata";
import { Action, createKoaServer, BadRequestError } from "routing-controllers";
import { verify } from "./jwt";
import setupDb from "./db";
import User from "./users/entity";
import RecipeController from "./recipes/controller";
import RecipeStepController from "./recipe-steps/controller";
import RecipeIngredientController from "./recipe-ingredients/controller";
import UserController from "./users/controller";
import LoginController from "./logins/controller";
import RecipeImageController from "./recipe-images/controller";
import * as cloudinary from "cloudinary";
import { cloudinarySettings } from "./constants";
import SelectedRecipeController from "./selected-recipes/controller";
import RecipeUserRatingController from "./recipe-user-rating/controller";
import IngredientController from "./ingredients/controller";
import RequestedIngredientController from "./requested-ingredients/controller";
import RecipeUserImageController from "./recipe-user-image/controller";
import ReportsController from "./reports/controller";
import LabelController from "./labels/controller";
import UserFollowController from "./user-follows/controller";


const port = process.env.PORT || 4000;

export const app = createKoaServer({
  cors: true,
  controllers: [
    RecipeController,
    RecipeStepController,
    RecipeIngredientController,
    RecipeImageController,
    UserController,
    LoginController,
    SelectedRecipeController,
    RecipeUserRatingController,
    IngredientController,
    RequestedIngredientController,
    RecipeUserImageController,
    ReportsController,
    LabelController,
    UserFollowController
  ],
  authorizationChecker: (action: Action) => {
    const header: string = action.request.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const [, token] = header.split(" ");

      try {
        return !!(token && verify(token));
      } catch (e) {
        throw new BadRequestError(e);
      }
    }

    return false;
  },
  currentUserChecker: async (action: Action) => {
    const header: string = action.request.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const [, token] = header.split(" ");

      if (token) {
        const { id } = verify(token);
        return User.findOne(id);
      }
    }
    return undefined;
  }
});

export const server = () =>
  setupDb()
    .then(_ => app.listen(port, () => console.log(`Listening on port ${port}`)))
    .catch(err => console.error(err));

server();

//Setup Cloudinary globally
cloudinary.config(cloudinarySettings);


