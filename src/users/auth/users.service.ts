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
import { ResetPasswordDto } from './reset-password.dto'; // Import the DTO

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<string> {
    const { username, password, securityAnswer } = createUserDto;

    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new BadRequestException('Tài khoản đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityAnswer.toString(), 10);

    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      answer_security: hashedAnswer,
    });

    await newUser.save();

    return `Chúc mừng ${newUser.username}, bạn đã đăng ký thành công!`;
  }

  // Đăng nhập
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.username, sub: user._id };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }

    return null;
  }
  // LẤY MÃ Ô TÊ PÊ
  async getOtp(
    username: string,
    securityAnswer: number,
  ): Promise<{ message: string; otp: string } | null> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    // Check rate limit
    const rateLimitMinutes = 1;
    const now = new Date();
    if (
      user.lastOtpRequest &&
      new Date(user.lastOtpRequest.getTime() + rateLimitMinutes * 60 * 1000) >
        now
    ) {
      throw new BadRequestException(
        `Bạn chỉ có thể yêu cầu mã OTP mỗi ${rateLimitMinutes} phút`,
      );
    }
    if (user && user.answer_security) {
      const isAnswerCorrect = await bcrypt.compare(
        securityAnswer.toString(),
        user.answer_security,
      );

      if (isAnswerCorrect) {
        const otp = speakeasy.totp({
          secret: process.env.OTP_SECRET,
          encoding: 'base32',
        });

        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        user.lastOtpRequest = now;

        await user.save();

        return {
          message: 'OTP đã được gửi đến bạn ♡',
          otp,
        };
      } else if (!user && !user.answer_security) {
        throw new Error('Câu trả lời không chính xác');
      }
    }

    return null;
  }
  // sẽ sửa type any thành string sau
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

  // async func này dùng để DI vào refresh token service bên file khác.
  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    await this.userModel.updateOne(
      { 'refreshTokens.token': refreshToken },
      { $set: { 'refreshTokens.$.isActive': false } },
    );
  }
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // reset password (check username, securityAnswer, thế new password vào user.password)
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    const { username, newPassword, securityAnswer } = resetPasswordDto;

    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const isAnswerCorrect = await bcrypt.compare(
      securityAnswer.toString(),
      user.answer_security,
    );
    if (!isAnswerCorrect) {
      throw new BadRequestException('Câu trả lời không chính xác');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return 'Mật khẩu của bạn đã được thay đổi thành công!';
  }
}
