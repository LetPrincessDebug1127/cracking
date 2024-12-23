import { BadRequestException } from '@nestjs/common';

const usernameRegex = /^[A-Za-z\d!@#$%^&*()_+=[\]{};:'",.<>?/-]{5,}$/;
const passwordRegex = /^(?!.*\s)(?=.*[!@#$%^&*()_+=[\]{};:'",.<>?/-])[A-Za-z\d!@#$%^&*()_+=[\]{};:'",.<>?/-]{5,}$/;

export function validateUserInput(username: string, password: string): void {
  if (!usernameRegex.test(username)) {
    throw new BadRequestException(
      'Tài khoản phải có ít nhất 5 ký tự và chỉ được bao gồm chữ cái hoặc chữ số.',
    );
  }
  if (!passwordRegex.test(password)) {
    throw new BadRequestException(
      'Mật khẩu phải có ít nhất 5 ký tự, bao gồm một chữ cái viết hoa và một ký tự đặc biệt.',
    );
  }
}
