import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { getServerAddress } from '../utils/util';

@Injectable()
export class AuthService {
  constructor(@InjectModel('users') private userModel: Model<UserDocument>) {}

  async register(body: any) {
    // simple validation left to original validators
    const avatar = (body.req && body.req.protocol)
      ? getServerAddress(body.req) + '/images/user_placeholder.png'
      : (body.avatar || '/images/user_placeholder.png');

    const newUser = new this.userModel({
      username: body.username,
      email: body.email,
      password: body.password,
      avatar,
      date: Date.now(),
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    try {
      const user = await newUser.save();
      const payload = { id: user.id, username: user.username, avatar: user.avatar, email: user.email };
      const token = jwt.sign(payload, process.env.JWTKey || 'secret', { expiresIn: 604800 });
      return { reply: 'Success', token: 'Bearer ' + token, user: payload };
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern && error.keyPattern.email) {
          return { status: 400, errors: { email: 'Email already exists' } };
        }
        if (error.keyPattern && error.keyPattern.username) {
          return { status: 400, errors: { username: 'Username already exists' } };
        }
      }
      return { status: 500, error: error.message };
    }
  }

  async login(body: any) {
    const { email, password } = body;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return { status: 404, errors: { email: 'Email not found' } };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const payload = { id: user.id, username: user.username, avatar: user.avatar, email: user.email };
      const token = jwt.sign(payload, process.env.JWTKey || 'secret', { expiresIn: 604800 });
      return { reply: 'Success', token: 'Bearer ' + token, user: payload };
    }
    return { status: 400, errors: { password: 'Password not correct' } };
  }
}
