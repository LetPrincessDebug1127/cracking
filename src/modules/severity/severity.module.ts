import { Module } from '@nestjs/common';
import { PasiController } from './severity.controller';
import { PasiScore } from './pasi.scores';

@Module({
  controllers: [PasiController],
  providers: [PasiScore],
  exports: [PasiScore],
})
export class SeverityModule {}
