import {
  JsonController,
  Post,
  Put,
  Body,
  ForbiddenError,
  Get,
  Param,
  NotFoundError,
  BadRequestError,
  Authorized,
  CurrentUser,
  UnauthorizedError,
  InternalServerError
} from "routing-controllers";
import User from "./entity";

function createRandomPassword () {
const passwordCharacters = `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[\]^_{|}~`;
const passwordLength = 10;
const randomPassword = Array(passwordLength).fill(passwordCharacters).map(x => { return x[Math.floor(Math.random() * x.length)] }).join('');

return randomPassword
}

interface PasswordChange {
  password: string;
  newPassword: string;
}

@JsonController()
export default class UserController {
  @Post("/users")
  async signup(@Body() data: User) {
    const { password, email, ...rest } = data;

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });
    if (existingUser)
      throw new ForbiddenError("User with this email already exists");

    //If no username is provided, it is set to the local part of the email address
    if (!rest.username) rest.username = email.split("@")[0];

    const entity = User.create({ ...rest, email: email.toLowerCase() });
    await entity.setPassword(password);

    const user = await entity.save();

    return user;
  }

  @Get(`/users/:id`)
  async getUser(@Param("id") id: number) {
    const user = await User.findOne(id);

    if (!user) throw new NotFoundError("User not found");

    const { password, ...rest } = user;

    return rest;
  }

  @Put("/users/:id/new-password")
  async changePassword(
    @Authorized()
    @Param("id")
    id: number,
    @Body() passwords: PasswordChange,
    @CurrentUser() user: User
  ) {
    if (id !== user.id)
      throw new UnauthorizedError("No authorization for the provided user id");

    if (!(await user.checkPassword(passwords.password)))
      throw new ForbiddenError("Current password is incorrect");
    if (passwords.newPassword.length < 8)
      throw new BadRequestError(
        "New password must be at least 8 characters long"
      );

    try {
      await user.setPassword(passwords.newPassword);
      await user.save();
    } catch (e) {
      console.log(e);
    }

    return {};
  }

  @Put("/users/:id/reset-password")
  async resetPassword(
    @Authorized()
    @Param("id")
    id: number,
    @CurrentUser() user: User
  ) {
    if (id !== user.id)
      throw new UnauthorizedError("No authorization for the provided user id");


    try {
      const newPassword = createRandomPassword()

      await user.setPassword(newPassword);
      await user.save();

      return {newPassword}
    } catch (e) {
      console.log(e);
      throw new InternalServerError('Something went wrong resetting the password')
    }
    
  }

  @Put("/users/:id")
  async changeUser(
    @Authorized()
    @Param("id")
    id: number,
    @Body() update: any,
    @CurrentUser() user: User
  ) {
    if (id !== user.id)
      throw new UnauthorizedError("No authorization for the provided user id");

    try {
      const {password, email, ...updateToMerge} = update

      return User.merge(user, updateToMerge).save()

    } catch (e) {
      console.log(e);
    }
  }
}
