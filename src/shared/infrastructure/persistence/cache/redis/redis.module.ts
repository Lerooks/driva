import { Global, Module } from '@nestjs/common';
import { RedisModule as NestJsRedisModule } from '@nestjs-modules/ioredis';

@Global()
@Module({
  imports: [
    NestJsRedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
  ],
  exports: [NestJsRedisModule],
})
export class RedisModule {}
