import 'reflect-metadata'
import {createKoaServer} from "routing-controllers"
import setupDb from './db'
import RecipeController from './recipes/controller'

const port = process.env.PORT || 4000

const app = createKoaServer({
   controllers: [RecipeController]
})

setupDb()
  .then(_ =>
    app.listen(port, () => console.log(`Listening on port ${port}`))
  )
  .catch(err => console.error(err))
