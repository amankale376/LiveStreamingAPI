import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Auth implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body;
      const password = req.body.password;
      const hashedPassword = await bcrypt.hash(password, 8);
      user.password = hashedPassword;
      req.body = user;
      next();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
