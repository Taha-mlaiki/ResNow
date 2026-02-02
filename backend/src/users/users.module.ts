import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';
import { PasswordService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [PasswordService],
  exports: [TypeOrmModule, PasswordService],
})
export class UsersModule {}
