import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ||
      process.env.REDIS_URL ||
      this.configService.get<string>('redis.url');

    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set; Redis cache disabled');
      return;
    }

    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis error: ${String(err?.message || err)}`);
    });
  }

  get isEnabled(): boolean {
    return !!this.client;
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.client) return null;

    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
      const raw = await this.client.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;

    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
      const payload = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, payload, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, payload);
      }
    } catch {
      // ignore
    }
  }

  async onModuleDestroy() {
    if (!this.client) return;
    try {
      await this.client.quit();
    } catch {
      // ignore
    }
  }
}
