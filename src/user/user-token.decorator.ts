import { createParamDecorator } from "@nestjs/common";

export const SignedAccessToken = createParamDecorator((data, req) => {
  return req.args[0].accessToken.split(".")[2];
});
