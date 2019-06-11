import {
    JsonController,
    Post,
    HttpCode,
    Param,
    Authorized,
    UnauthorizedError,
    CurrentUser,
    Get,
    NotFoundError
  } from "routing-controllers";
  import { getRepository } from "typeorm";
  import User from '../users/entity'
import UserFollow from "./entity";
  
  @JsonController()
  export default class UserFollowController {
    @Post("/users/:userId/headChefs/:headChefId")
    @Authorized()
    @HttpCode(201)
    async addUserFollow(
      @Param("userId") userId: number,
      @Param("headChefId") headChefId: number,
      @CurrentUser() user: User
    ) {

      if (userId !== user.id)
        throw new UnauthorizedError("Unauthorized action.");
  
    const newFollow = {
        headChefId,
        sousChefId: userId
    }
 
      return UserFollow.create(newFollow).save();
    }

    @Get(`/users/:userId/headChefs`)
    @Authorized()
    async getAllHeadchefs(@Param("userId") userId: number) {
  
        const user = await getRepository(User)
        .createQueryBuilder("user")
        .where("user.id = :id", { id: userId })
        .leftJoinAndSelect("user.chefsFollowed", "headChef")
        .getOne();

        if(!user) throw new NotFoundError("No user found")

        const allHeadChefIds = user.chefsFollowed.map( headChef =>  headChef.headChefId )

        return User.findByIds(allHeadChefIds, {select: ["id", "username"]})

    }
  }
  