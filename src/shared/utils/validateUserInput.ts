import { BadRequestException } from '@nestjs/common';

const usernameRegex = /^.{5,}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/;

export function validateUserInput(username: string, password: string): void {
  if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
    throw new BadRequestException(
      'Tài khoản & mật khẩu phải có ít nhất 5 ký tự, bao gồm một chữ cái viết hoa và một ký tự đặc biệt.',
    );
  }
}
