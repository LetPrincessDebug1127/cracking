import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';
import { CreateUserDto } from './register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async generateToken(username: string): Promise<string> {
    const payload = { username };
    return this.jwtService.sign(payload);
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const { username, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new BadRequestException('Tài khoản đã tồn tại');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
    });
    await newUser.save();

    const payload = { username: newUser.username, sub: newUser._id };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.username, sub: user._id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
