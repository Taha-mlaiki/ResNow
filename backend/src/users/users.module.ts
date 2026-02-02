import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';
import { PasswordService, UsersService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [PasswordService, UsersService],
  exports: [TypeOrmModule, PasswordService, UsersService],
})
export class UsersModule {}
