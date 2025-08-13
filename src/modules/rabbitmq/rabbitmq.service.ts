import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { SignalsService } from '../signals/signals.service';
import { RabbitMQException } from '../../common/exceptions/custom-exceptions';

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
      
      if (!url) {
        throw new RabbitMQException('RabbitMQ URL is not configured');
      }

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      this.logger.log('Connected to RabbitMQ successfully');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw new RabbitMQException('Failed to establish connection to RabbitMQ', error);
    }
  }

  private async setupQueue() {
    try {
      if (!this.channel) {
        throw new RabbitMQException('RabbitMQ channel is not available');
      }

      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });
      this.logger.log(`Queue '${this.queueName}' is ready`);
    } catch (error) {
      this.logger.error('Failed to setup queue:', error);
      throw new RabbitMQException('Failed to setup RabbitMQ queue', error);
    }
  }

  private async startConsumer() {
    try {
      if (!this.channel) {
        throw new RabbitMQException('RabbitMQ channel is not available');
      }

      await this.channel.consume(this.queueName, async (msg) => {
        if (msg) {
          try {
            this.logger.log(`Processing message: ${msg.content.toString().substring(0, 100)}...`);
            
            const content = JSON.parse(msg.content.toString());
            
            if (!content || typeof content !== 'object') {
              throw new Error('Invalid message format');
            }

            const deviceId = Object.keys(content)[0];
            if (!deviceId) {
              throw new Error('No device ID found in message');
            }

            this.logger.log(`Received message for device: ${deviceId}`);

            const processedData = await this.signalsService.processXrayData(content);
            await this.signalsService.saveProcessedData(processedData);

            this.channel.ack(msg);
            this.logger.log(`Message processed successfully for device: ${deviceId}`);
          } catch (error) {
            this.logger.error('Error processing message:', error);
            
            // Reject the message and don't requeue it to prevent infinite loops
            this.channel.nack(msg, false, false);
            
            // Log additional details for debugging
            if (msg.content) {
              this.logger.error(`Failed message content: ${msg.content.toString().substring(0, 200)}...`);
            }
          }
        }
      });
      this.logger.log('Consumer started successfully');
    } catch (error) {
      this.logger.error('Failed to start consumer:', error);
      throw new RabbitMQException('Failed to start RabbitMQ consumer', error);
    }
  }

  async publishMessage(message: any) {
    try {
      if (!this.channel) {
        throw new RabbitMQException('RabbitMQ channel is not available');
      }

      if (!message || typeof message !== 'object') {
        throw new RabbitMQException('Invalid message format');
      }

      const buffer = Buffer.from(JSON.stringify(message));
      await this.channel.sendToQueue(this.queueName, buffer, {
        persistent: true,
      });
      
      const deviceId = Object.keys(message)[0];
      this.logger.log(`Message published successfully for device: ${deviceId}`);
    } catch (error) {
      this.logger.error('Failed to publish message:', error);
      throw new RabbitMQException('Failed to publish message to RabbitMQ', error);
    }
  }

  private async closeConnection() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.logger.log('RabbitMQ channel closed');
      }
      if (this.connection) {
        await this.connection.close();
        this.logger.log('RabbitMQ connection closed');
      }
      this.logger.log('RabbitMQ connection closed successfully');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
      // Don't throw here as this is cleanup code
    }
  }
}
