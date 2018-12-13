import 'reflect-metadata'
import {createKoaServer} from "routing-controllers"
import setupDb from './db'
import RecipeController from './recipes/controller'
import RecipeStepController from './recipe-steps/controller'

const port = process.env.PORT || 4000

export const app = createKoaServer({
   controllers: [RecipeController, RecipeStepController
  ]
})

export const server = () => setupDb()
  .then(_ =>
    app.listen(port, () => console.log(`Listening on port ${port}`))
  )
  .catch(err => console.error(err))

  server();