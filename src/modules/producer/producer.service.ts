import { Injectable, Logger } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { XrayMessage } from '../../common/interfaces/xray-data.interface';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);

  constructor(private readonly rabbitmqService: RabbitmqService) {}

  async sendSampleData() {
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

    try {
      await this.rabbitmqService.publishMessage(sampleData);
      this.logger.log('Sample data sent successfully');
    } catch (error) {
      this.logger.error('Failed to send sample data:', error);
      throw error;
    }
  }

  async sendRandomData(deviceId: string = this.generateDeviceId()) {
    const randomData: XrayMessage = {
      [deviceId]: {
        data: this.generateRandomDataPoints(),
        time: Date.now(),
      },
    };

    try {
      await this.rabbitmqService.publishMessage(randomData);
      this.logger.log(`Random data sent for device: ${deviceId}`);
    } catch (error) {
      this.logger.error('Failed to send random data:', error);
      throw error;
    }
  }

  private generateDeviceId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private generateRandomDataPoints() {
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
  }
}
