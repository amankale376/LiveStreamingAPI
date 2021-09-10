import { Body, Controller, Get, Param, Post, Render } from '@nestjs/common';
import { Token } from './token.decorator';
import { UserService } from './user.service';

@Controller('/')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('login')
  Login(@Body() user) {
    return this.userService.login(user);
  }

  @Post('signup')
  Signup(@Body() user) {
    return this.userService.signup(user);
  }

  @Get('start')
  Start(@Token() token) {
    return this.userService.startStream(token);
  }

  @Get('watch/:email')
  @Render('watchStream')
  async Watch(@Param('email') email) {
    const stream_name = await this.userService.watchStream(email);
    return { stream_name };
  }

  @Get('AllStreams')
  allStreams(@Token() Token) {
    return this.userService.allStreams();
  }
}
