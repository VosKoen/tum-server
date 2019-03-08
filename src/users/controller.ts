import { JsonController, Post, Body, BadRequestError } from 'routing-controllers'
import User from './entity';

@JsonController()
export default class UserController {

  @Post('/users')
  async signup(
    @Body() data: User
  ) {
    const {password, email, ...rest} = data
    console.log(password, email, rest)
    
    const existingUser = await User.findOne({where: {email: email.toLowerCase()}})
    console.log(existingUser)

    if(existingUser) throw new BadRequestError("User with this username already exists") 

    const entity = User.create({...rest, email: email.toLowerCase()})
    await entity.setPassword(password)

    
    const user = await entity.save()

    return user
  }
}
