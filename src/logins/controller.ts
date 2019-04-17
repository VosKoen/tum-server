import { IsString } from 'class-validator'
import { JsonController, Post, Body, BadRequestError } from 'routing-controllers'
import { sign } from '../jwt'
import User from '../users/entity'

class AuthenticatePayload {
  @IsString()
  email: string

  @IsString()
  password: string
}

@JsonController()
export default class LoginController {

  @Post('/logins')
  async authenticate(
    @Body() { email, password }: AuthenticatePayload
  ) {
    const user = await User.findOne({ where: { email: email.toLowerCase() } })
    if (!user || !user.id || !await user.checkPassword(password)) throw new BadRequestError('The combination of email address and password is not valid')

    const jwt = sign({ id: user.id })
    console.log(jwt)
    return { jwt }
  }
}
