import { createParamDecorator } from "@nestjs/common";
import { User } from "./entities/user.entity";

export const LoggedInUser = createParamDecorator((data, req): User => {
  return req.args[0].user;
});
