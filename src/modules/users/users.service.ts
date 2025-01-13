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
import { User } from '../models/user.schema';
import { CreateUserDto } from '../dto.all.ts/users/register.dto';
import { ResetPasswordDto } from '../dto.all.ts/users/reset-password.dto';
import { Types } from 'mongoose';
import { validateUserInput } from '../../shared/utils/validateUserInput';
import { isRateLimited } from '../../shared/utils/rate-limit.util';
import { RSAUtils } from '../../shared/utils/RSAUtils';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class UsersService {
  private failedAttempts = new Map<
    string,
    { attempts: number; blockUntil: Date }
  >();
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<Object> {
    const { username, password, securityAnswer } = createUserDto;

    validateUserInput(username, password);

    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) throw new BadRequestException('Tài khoản đã tồn tại');

    const hashedPassword = await bcrypt.hash(password, 10);

    const encryptedAnswer = RSAUtils.encryptWithPublicKey(securityAnswer, path.join(__dirname, '../../publicKey.pem'));


    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      answer_security: encryptedAnswer,
      role: 'user',
  
    });

    await newUser.save();

    return {
      message: `Chúc mừng ${newUser.username}, bạn đã đăng ký thành công với vai trò user!`,
    };
  }

private async sendOtpToEmail(decryptedAnswer: string, otp: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, 
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER, 
      pass: process.env.SMTP_PASSWORD, 
    },
  });

  const mailOptions = {
    from: `"Shiso" <${process.env.SMTP_USER}>`, 
    to: decryptedAnswer, 
    subject: 'ShiSo sends OTP to you', 
    text: `Your OTP: ${otp}`, 
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new BadRequestException('Không thể gửi email OTP');
  }
}

  // LẤY MÃ Ô TÊ PÊ theo múi giờ csdl
  async getOtp(
  username: string,
  securityAnswer: string,
): Promise<{ message: string; otp: string } | null> {
  const user = await this.userModel.findOne({ username });
  if (!user) {
    throw new UnauthorizedException('Người dùng không tồn tại');
  }

  // Check rate limit with UTC time
  const rateLimitMinutes = 1;
  const now = Date.now();

  if (isRateLimited(user.lastOtpRequest, rateLimitMinutes)) {
    throw new BadRequestException(
      `Bạn chỉ có thể yêu cầu mã OTP mỗi ${rateLimitMinutes} phút`,
    );
  }

 
  const decryptedAnswer = RSAUtils.decryptWithPrivateKey(user.answer_security, path.join(__dirname, '../../privateKey.pem'));


  if (securityAnswer.trim() !== decryptedAnswer.trim()) {
    throw new BadRequestException('Email không chính xác');
  }

  const otp = speakeasy.totp({
    secret: process.env.OTP_SECRET,
    encoding: 'base32',
  });

  user.otp = otp;
  user.otpExpires = new Date(now + 5 * 60 * 1000); 
  user.lastOtpRequest = new Date(now);

  await user.save();
  await this.sendOtpToEmail(decryptedAnswer, otp); 

  return {
    message: 'OTP đã được gửi đến email bạn ♡',
    otp,
  };
}


  private handleFailedAttempt(username: string): void {
    const MAX_ATTEMPTS = 5;
    const BLOCK_DURATION = 5 * 60 * 1000; // 5 phút
    const now = new Date();

    let userAttemptData = this.failedAttempts.get(username);

    if (!userAttemptData) {
      userAttemptData = { attempts: 1, blockUntil: null };
    }

    if (userAttemptData.blockUntil && userAttemptData.blockUntil > now) {
      throw new BadRequestException(
        `Tài khoản ${username} bị tạm khóa do nhập sai quá nhiều lần. Vui lòng thử lại sau 5 phút.`,
      );
    }

    userAttemptData.attempts += 1;

    if (userAttemptData.attempts >= MAX_ATTEMPTS) {
      userAttemptData.blockUntil = new Date(now.getTime() + BLOCK_DURATION);
    }

    this.failedAttempts.set(username, userAttemptData);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const now = new Date();

    this.handleFailedAttempt(username);

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
      throw new BadRequestException('Tên tài khoản hoặc mật khẩu không đúng');
    }
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
    const now = Date.now();

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

     const otp = speakeasy.totp({
      secret: process.env.OTP_SECRET,
      encoding: 'base32',
    });

    user.otp = otp;
    user.otpExpires = new Date(now + 5 * 60 * 1000);
    user.lastOtpRequest = new Date(now);

    await user.save();


    return otp;
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

    if (user.role === 'user' && userId._id === targetDelete._id) {
      await this.userModel.findByIdAndDelete(targetDelete);
      return 'bạn đã xóa tài khoản này với tư cách là chủ sỡ hữu tài khoản';
    }
    if (user.role === 'admin') {
      await this.userModel.findByIdAndDelete(targetDelete);
      return 'Bạn đã xóa tài khoản này với tư cách là admin';
    }

    if (user.role === 'user' && userId._id !== targetDelete._id) {
      return 'bạn không phải Admin để xóa tài khoản của người khác và cũng không phải chủ sở hữu tài khoản';
    }
  }
}
