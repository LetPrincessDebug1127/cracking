import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private secretNumber: number;

  constructor(private configService: ConfigService) {
    // Lấy biến môi trường SECRET_NUMBER
    this.secretNumber = parseInt(
      this.configService.get<string>('SECRET_NUMBER'),
    );
  }

  guessNumber(userGuess: number, playerName: string): string {
    if (userGuess === this.secretNumber) {
      const nameToDisplay = playerName ? playerName : 'bạn';
      return `Chúc mừng ${nameToDisplay}! Bạn đã đoán đúng số. Trò chơi kết thúc!`;
    } else if (userGuess < this.secretNumber) {
      return 'Gợi ý : số đúng là tổng số lượng các chữ cái trong câu hỏi, không bao gồm khoảng cách và "Câu hỏi:" !! Số của bạn đang nhỏ hơn';
    } else {
      return 'Gợi ý : số đúng là tổng số lượng các chữ cái trong câu hỏi, không bao gồm khoảng cách và "Câu hỏi:" !! Số của bạn đang lớn hơn';
    }
  }

  getCurrentNumber(): number {
    return this.secretNumber;
  }
}
