import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { XrayMessage } from '../../common/interfaces/xray-data.interface';
import { DataProcessingException } from '../../common/exceptions/custom-exceptions';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);

  constructor(private readonly rabbitmqService: RabbitmqService) {}

  async sendSampleData() {
    try {
      this.logger.log('Preparing to send sample data');
      
      const sampleData: XrayMessage = {
        '66bb584d4ae73e488c30a072': {
          data: [
            {
              0: 762,
              1: [51.339764, 12.339223833333334, 1.2038000000000002],
            },
            {
              0: 1766,
              1: [51.33977733333333, 12.339211833333334, 1.531604],
            },
            {
              0: 2763,
              1: [51.339782, 12.339196166666667, 2.13906],
            },
          ],
          time: 1735683480000,
        },
      };

      // Validate sample data before sending
      this.validateXrayMessage(sampleData);

      await this.rabbitmqService.publishMessage(sampleData);
      this.logger.log('Sample data sent successfully');
    } catch (error) {
      this.logger.error('Failed to send sample data:', error);
      
      if (error instanceof DataProcessingException) {
        throw error;
      }
      
      throw new DataProcessingException('Failed to send sample data', error);
    }
  }

  async sendRandomData(deviceId: string = this.generateDeviceId()) {
    try {
      this.logger.log(`Preparing to send random data for device: ${deviceId}`);
      
      if (!deviceId || deviceId.trim() === '') {
        throw new BadRequestException('Device ID is required');
      }

      const randomData: XrayMessage = {
        [deviceId]: {
          data: this.generateRandomDataPoints(),
          time: Date.now(),
        },
      };

      // Validate random data before sending
      this.validateXrayMessage(randomData);

      await this.rabbitmqService.publishMessage(randomData);
      this.logger.log(`Random data sent successfully for device: ${deviceId}`);
    } catch (error) {
      this.logger.error(`Failed to send random data for device ${deviceId}:`, error);
      
      if (error instanceof DataProcessingException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new DataProcessingException('Failed to send random data', error);
    }
  }

  private generateDeviceId(): string {
    try {
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    } catch (error) {
      this.logger.error('Error generating device ID:', error);
      throw new DataProcessingException('Failed to generate device ID', error);
    }
  }

  private generateRandomDataPoints() {
    try {
      const dataPoints = [];
      const numPoints = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < numPoints; i++) {
        dataPoints.push({
          0: Date.now() + i * 1000,
          1: [
            51.0 + (Math.random() - 0.5) * 0.1,
            12.0 + (Math.random() - 0.5) * 0.1,
            Math.random() * 5,
          ],
        });
      }

      return dataPoints;
    } catch (error) {
      this.logger.error('Error generating random data points:', error);
      throw new DataProcessingException('Failed to generate random data points', error);
    }
  }

  private validateXrayMessage(message: XrayMessage): void {
    try {
      if (!message || typeof message !== 'object') {
        throw new DataProcessingException('Invalid message format');
      }

      const deviceIds = Object.keys(message);
      if (deviceIds.length === 0) {
        throw new DataProcessingException('No device ID found in message');
      }

      const deviceId = deviceIds[0];
      const data = message[deviceId];

      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new DataProcessingException('Invalid data structure in message');
      }

      if (!data.time || typeof data.time !== 'number') {
        throw new DataProcessingException('Invalid timestamp in message');
      }

      if (data.data.length === 0) {
        throw new DataProcessingException('Message contains no data points');
      }

      // Validate each data point
      data.data.forEach((point: any, index: number) => {
        if (!point || typeof point !== 'object') {
          throw new DataProcessingException(`Invalid data point at index ${index}`);
        }

        if (typeof point[0] !== 'number') {
          throw new DataProcessingException(`Invalid time value at index ${index}`);
        }

        if (!Array.isArray(point[1]) || point[1].length !== 3) {
          throw new DataProcessingException(`Invalid coordinates at index ${index}`);
        }

        if (!point[1].every((coord: any) => typeof coord === 'number')) {
          throw new DataProcessingException(`Invalid coordinate values at index ${index}`);
        }
      });

      this.logger.log(`Message validation passed for device: ${deviceId}`);
    } catch (error) {
      this.logger.error('Message validation failed:', error);
      throw error;
    }
  }
}
