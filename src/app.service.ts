import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly secretNumber: number;

  constructor(private readonly configService: ConfigService) {
    const secretNumberFromEnv = this.configService.get<string>('SECRET_NUMBER');
    this.secretNumber = this.validateSecretNumber(secretNumberFromEnv);
  }

  private validateSecretNumber(value: string | undefined): number {
    const parsedNumber = parseInt(value, 10);
    if (isNaN(parsedNumber)) {
      throw new Error(
        'SECRET_NUMBER không hợp lệ! Vui lòng kiểm tra biến môi trường.',
      );
    }
    return parsedNumber;
  }

  guessNumber(userGuess: number, playerName?: string): string {
    const nameToDisplay = playerName?.trim() || 'bạn';
    const isCorrect = userGuess === this.secretNumber;

    const hints = this.generateHint(userGuess);
    return isCorrect
      ? `🎉 Chúc mừng ${nameToDisplay}! Bạn đã đoán đúng số bí mật. Trò chơi kết thúc!`
      : `${hints} 🚀 Cố gắng thêm nhé, ${nameToDisplay}!`;
  }

  private generateHint(userGuess: number): string {
    const hintBase =
      'Gợi ý: số đúng là tổng số chữ cái trong câu hỏi, không bao gồm khoảng cách và "Câu hỏi:"!';
    if (userGuess < this.secretNumber) {
      return `${hintBase} 🔻 Số của bạn đang nhỏ hơn số bí mật.`;
    }
    return `${hintBase} 🔺 Số của bạn đang lớn hơn số bí mật.`;
  }

  getCurrentNumber(): number {
    return this.secretNumber;
  }
}
