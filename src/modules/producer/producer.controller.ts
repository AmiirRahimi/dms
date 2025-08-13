import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProducerService } from './producer.service';

@ApiTags('producer')
@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('send-sample')
  @ApiOperation({ summary: 'Send sample x-ray data' })
  @ApiResponse({ status: 200, description: 'Sample data sent successfully' })
  async sendSampleData() {
    await this.producerService.sendSampleData();
    return { message: 'Sample data sent successfully' };
  }

  @Post('send-random')
  @ApiOperation({ summary: 'Send random x-ray data' })
  @ApiResponse({ status: 200, description: 'Random data sent successfully' })
  async sendRandomData() {
    await this.producerService.sendRandomData();
    return { message: 'Random data sent successfully' };
  }

  @Post('send-random/:deviceId')
  @ApiOperation({ summary: 'Send random x-ray data for specific device' })
  @ApiResponse({ status: 200, description: 'Random data sent successfully' })
  async sendRandomDataForDevice(@Param('deviceId') deviceId: string) {
    await this.producerService.sendRandomData(deviceId);
    return { message: `Random data sent successfully for device: ${deviceId}` };
  }
}
