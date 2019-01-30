import 'reflect-metadata'
import {createKoaServer} from "routing-controllers"
import setupDb from './db'
import RecipeController from './recipes/controller'
import RecipeStepController from './recipe-steps/controller'
import RecipeIngredientController from './recipe-ingredients/controller'
import UserController from './users/controller'
import LoginController from './logins/controller'
import RecipeImageController from './recipe-images/controller'

const port = process.env.PORT || 4000

export const app = createKoaServer({
    cors: true,
   controllers: [RecipeController, RecipeStepController, RecipeIngredientController, RecipeImageController, UserController, LoginController
  ]
})

export const server = () => setupDb()
  .then(_ =>
    app.listen(port, () => console.log(`Listening on port ${port}`))
  )
  .catch(err => console.error(err))

  server();