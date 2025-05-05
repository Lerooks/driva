/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import {
  AmqpConnectionManager,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';
import { Channel } from 'amqplib';

interface QueueOptions {
  durable?: boolean;
  noAck?: boolean;
}

interface RabbitMQConfig {
  urls: string[];
  queueOptions?: QueueOptions;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: AmqpConnectionManager | null = null;
  private channelWrapper: ChannelWrapper | null = null;
  private readonly config: RabbitMQConfig = {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost'],
    queueOptions: { durable: true, noAck: false },
  };

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      this.connection = connect(this.config.urls);
      this.setupChannel();
      this.logger.log('RabbitMQ connection initialized');
    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ connection', error);
      throw error;
    }
  }

  private setupChannel(): void {
    if (!this.connection) {
      throw new Error('Connection not established');
    }

    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async (channel: Channel): Promise<void> => {
        try {
          await channel.assertQueue('cnpj_enrichment_queue', {
            durable: this.config.queueOptions?.durable ?? true,
          });
        } catch (error) {
          this.logger.error(
            'Error asserting queue',
            error instanceof Error ? error.message : String(error),
          );
          throw new Error('Failed to assert queue');
        }
      },
    });
  }

  onModuleInit(): void {
    if (!this.connection || !this.channelWrapper) {
      this.initialize();
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.channelWrapper) {
        await this.channelWrapper.close();
        this.channelWrapper = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log('RabbitMQ connection closed gracefully');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }

  async publishToQueue<T>(queue: string, message: T): Promise<boolean> {
    if (!this.channelWrapper) {
      this.logger.error('Channel not available for publishing');
      return false;
    }

    try {
      const result = await this.channelWrapper.sendToQueue(queue, message, {
        timeout: 30000, // 30 seconds
      });

      return result;
    } catch {
      // this.logger.error(`Error publishing to queue ${queue}`, error);
      return false;
    }
  }

  async consumeFromQueue<T>(
    queue: string,
    callback: (msg: T) => Promise<void> | void,
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('Channel not available for consuming');
    }

    try {
      await this.channelWrapper.addSetup(async (channel: Channel) => {
        await channel.consume(queue, message => {
          if (!message) return;

          try {
            const content: T = JSON.parse(message.content.toString());
            void Promise.resolve(callback(content));
            channel.ack(message);
          } catch (error) {
            this.logger.error(`Error processing message from ${queue}`, error);
            channel.nack(message, false, false);
          }
        });
      });
      this.logger.log(`Successfully started consuming from queue: ${queue}`);
    } catch (error) {
      this.logger.error(`Failed to setup consumer for queue ${queue}`, error);
      throw error;
    }
  }

  async listenToQueue<T>(
    queue: string,
    callback: (message: T) => Promise<void> | void,
    options: { noAck?: boolean } = { noAck: false },
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('Channel not available for listening');
    }

    try {
      await this.channelWrapper.addSetup(async (channel: Channel) => {
        await channel.consume(queue, message => {
          if (!message) return;

          try {
            const content = JSON.parse(message.content.toString()) as T;
            void Promise.resolve(callback(content));

            if (!options.noAck) {
              channel.ack(message);
            }
          } catch (error) {
            this.logger.error(
              `Error processing message from ${queue}: ${error instanceof Error ? error.message : String(error)}`,
            );
            channel.nack(message, false, false);
          }
        });
      });
      this.logger.log(`Started listening to queue: ${queue}`);
    } catch (error) {
      this.logger.error(
        `Error setting up listener for queue ${queue}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
