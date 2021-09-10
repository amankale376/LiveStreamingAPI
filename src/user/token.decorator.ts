// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.header('Authorization').replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      return (request.token = decoded);
    } catch (error) {
      throw new BadRequestException(error);
    }
  },
);
