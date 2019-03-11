import {
  JsonController,
  Post,
  Put,
  Body,
  ForbiddenError,
  Get,
  Param,
  NotFoundError,
  BadRequestError
} from "routing-controllers";
import User from "./entity";

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
      throw new ForbiddenError("User with this username already exists");

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
    @Param("id") id: number,
    @Body() passwords: PasswordChange
  ) {
    const user = await User.findOne(id);

    if (!user) throw new NotFoundError("User not found");
    if (!(await user.checkPassword(passwords.password)))
      throw new ForbiddenError("Current password is incorrect");
    if (passwords.newPassword.length < 8)
      throw new BadRequestError("New password must be at least 8 characters long");

      user

    try {
      await user.setPassword(passwords.newPassword)
      await user.save()
    } catch (e) {
      console.log(e);
    }

    return {};
  }
}
