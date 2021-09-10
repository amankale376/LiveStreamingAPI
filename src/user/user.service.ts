/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Stream } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid} from 'uuid';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Stream)
    private streamRepo: Repository<Stream>,
  ) {}

  async login(body) {
    try {
      const user = await this.userRepo.findOne({
        where: { email: body.email },
      });
   const issPass =   await bcrypt.compare(body.password, user.password);
   if(issPass === false){
     throw new UnauthorizedException('Authorization failed')
   }
      const token = jwt.sign({ id: user.id.toString() }, process.env.SECRET, {
        expiresIn: '1h',
      });
      return { token: token ,
      stream_key:user.pass_key
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async signup(body){
    try {
      const user =  await this.userRepo.findOne({where:{email:body.email}})
   if(user){
      throw new BadRequestException("email already registered");
   }
   const newUser = new User();
   newUser.fullname = body.fullname;
   newUser.email = body.email;
   newUser.password = body.password;
   newUser.pass_key = uuid();
  await this.userRepo.save(newUser);
   return {
     fullname: body.fullname,
     email: body.email,
     message: 'You are registered!'
   }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async startStream(token) {
    const StreamId = uuid();
    try {
     const user = await this.userRepo.findOne({where:{id:token.id}})
     await this.userRepo.save(user);
      return {
        message:'use this exact address and stream key to start streaming',
        address:'rtmp://localhost:1935/'+StreamId+'/',
        stream_key:user.pass_key
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async watchStream(email){
    try {
      const stream = await this.streamRepo.findOne({where:{endAt:'NOT_ENDED', email:email}, select:['stream_name']});
      return stream.stream_name;
    } catch (error) {
      throw new BadRequestException(error)
    }

  }
  async allStreams(){
    try {
      const streams = await this.streamRepo.find({where:{endAt:'NOT_ENDED'}, select:['email'] , order:{id:'DESC'}});
      return streams;
    } catch (error) {
      
    }
  }
}
