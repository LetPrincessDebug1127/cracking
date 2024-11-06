import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { User } from '../../models/user.schema';
import { CreateUserDto } from './register.dto';
import { ResetPasswordDto } from './reset-password.dto';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
  // tạo một ctdl để lưu username và số lần ng đó đăng nhập thất bại, cũng như là khi nào người đó được unblock
  // mình dùng Map() là một data structure của js để lưu cặp key value nó cung cấp các method như get và set để lấy ra và thay đổi value của key
  private failedAttempts = new Map<
    string,
    { attempts: number; blockUntil: Date }
  >();
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 5 * 60 * 1000;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<string> {
    const { username, password, securityAnswer } = createUserDto;

    const usernameRegex = /^.{5,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/;

    if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
      throw new BadRequestException(
        'Tài khoản & mật khẩu phải có ít nhất 5 ký tự, bao gồm một chữ cái viết hoa và một ký tự đặc biệt.',
      );
    }

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
      role: 'user',
    });

    await newUser.save();

    return `Chúc mừng ${newUser.username}, bạn đã đăng ký thành công với vai trò user!`;
  }

  async validateUser(username: string, password: string): Promise<any> {
    const MAX_ATTEMPTS = 5;
    const BLOCK_DURATION = 5 * 60 * 1000;
    const now = new Date();

    // Map() lúc này chưa có username mà get() thì nó return undefined => lúc này userAttemptData sẽ falsy
    let userAttemptData = this.failedAttempts.get(username);

    if (userAttemptData && userAttemptData.blockUntil > now) {
      throw new BadRequestException(
        `Tài khoản ${username} bị tạm khóa do nhập sai quá nhiều lần. Vui lòng thử lại sau 5 phút.`,
      );
    }

    const user = await this.userModel.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      this.failedAttempts.delete(username);

      const payload = {
        username: user.username,
        sub: user._id,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } else {
      if (!userAttemptData) {
        userAttemptData = { attempts: 1, blockUntil: null };
      } else {
        userAttemptData.attempts += 1;
      }

      if (userAttemptData.attempts >= MAX_ATTEMPTS) {
        userAttemptData.blockUntil = new Date(now.getTime() + BLOCK_DURATION);
      }

      this.failedAttempts.set(username, userAttemptData);

      throw new BadRequestException('Tên tài khoản hoặc mật khẩu không đúng');
    }
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

  // Tạo admin

  async createAdmin(createUserDto: CreateUserDto): Promise<string> {
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
      role: 'admin', // Đặt role là admin
    });
    await newUser.save();

    return `Chúc mừng ${newUser.username}, bạn đã được tạo thành công với vai trò admin!`;
  }

  async deleteUser(
    userId: Types.ObjectId,
    targetDelete: Types.ObjectId,
  ): Promise<string> {
    const admin = await this.userModel.findById(userId);
    const user = await this.userModel.findById(targetDelete);

    if (!user || !admin) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    if (user.role === 'user') {
      return 'Bạn không phải Admin để xóa tài khoản của người khác';
    }

    if (user.role === 'user' && userId._id === targetDelete._id) {
      await this.userModel.findByIdAndDelete(targetDelete);
      return 'bạn đã xóa tài khoản này với tư cách là chủ sỡ hữu tài khoản';
    }
    if (user.role === 'admin') {
      await this.userModel.findByIdAndDelete(targetDelete);
      return 'Bạn đã xóa tài khoản này với tư cách là admin';
    }
  }
}
