import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { SignalsService } from '../signals/signals.service';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: any;
  private channel: any;
  private readonly queueName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly signalsService: SignalsService,
  ) {
    this.queueName = this.configService.get<string>(
      'RABBITMQ_QUEUE',
      'xray-queue',
    );
  }

  async onModuleInit() {
    await this.connect();
    await this.setupQueue();
    await this.startConsumer();
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private async connect() {
    try {
      const url = this.configService.get<string>(
        'RABBITMQ_URL',
        'amqp://localhost:5672',
      );
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  private async setupQueue() {
    try {
      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });
      this.logger.log(`Queue '${this.queueName}' is ready`);
    } catch (error) {
      this.logger.error('Failed to setup queue:', error);
      throw error;
    }
  }

  private async startConsumer() {
    try {
      await this.channel.consume(this.queueName, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            this.logger.log(
              `Received message for device: ${Object.keys(content)[0]}`,
            );

            const processedData =
              await this.signalsService.processXrayData(content);
            await this.signalsService.saveProcessedData(processedData);

            this.channel.ack(msg);
            this.logger.log('Message processed successfully');
          } catch (error) {
            this.logger.error('Error processing message:', error);
            this.channel.nack(msg, false, false);
          }
        }
      });
      this.logger.log('Consumer started');
    } catch (error) {
      this.logger.error('Failed to start consumer:', error);
      throw error;
    }
  }

  async publishMessage(message: any) {
    try {
      const buffer = Buffer.from(JSON.stringify(message));
      await this.channel.sendToQueue(this.queueName, buffer, {
        persistent: true,
      });
      this.logger.log('Message published successfully');
    } catch (error) {
      this.logger.error('Failed to publish message:', error);
      throw error;
    }
  }

  private async closeConnection() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
    }
  }
}
