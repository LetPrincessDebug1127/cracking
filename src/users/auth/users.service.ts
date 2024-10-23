import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
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
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { access_token: token, refresh_token: refreshToken };
  }
  // Login and generate OTP
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const otp = speakeasy.totp({
        secret: process.env.OTP_SECRET,
        encoding: 'base32',
      });

      // Set OTP and expiration (e.g., valid for 5 minutes)
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
      await user.save();

      const payload = { username: user.username, sub: user._id };

      // Generate access token
      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

      // Generate refresh token
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return {
        message: 'OTP generated and sent to the user',
        otp,
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }
    return null;
  }
  // Verify OTP
  async verifyOtp(username: string, otp: string): Promise<any> {
    const user = await this.userModel.findOne({ username });
    if (!user || !user.otp || !user.otpExpires) {
      throw new BadRequestException('Invalid OTP');
    }

    if (new Date() > user.otpExpires) {
      throw new BadRequestException('OTP expired');
    }

    const isValidOtp = speakeasy.totp.verify({
      secret: process.env.OTP_SECRET,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (isValidOtp) {
      const payload = { username: user.username, sub: user._id };
      const token = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return { access_token: token, refresh_token: refreshToken };
    } else {
      throw new BadRequestException('Invalid OTP');
    }
  }

  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    // Giả sử bạn có trường `refreshTokens` trong User schema để lưu trữ refresh tokens
    await this.userModel.updateOne(
      { 'refreshTokens.token': refreshToken },
      { $set: { 'refreshTokens.$.isActive': false } },
    );
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
