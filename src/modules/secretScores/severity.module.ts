import { Module } from '@nestjs/common';
import { PasiScore } from './pasi.scores';

@Module({
  controllers: [],
  providers: [PasiScore],
  exports: [PasiScore],
})
export class ScoreModule {}
