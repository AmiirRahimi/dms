import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignalsService } from './signals.service';
import { CreateSignalDto, UpdateSignalDto } from '../../common/dto';
import { Signal } from './schemas/signal.schema';

@ApiTags('signals')
@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new signal' })
  @ApiResponse({ status: 201, description: 'Signal created successfully' })
  create(@Body() createSignalDto: CreateSignalDto): Promise<Signal> {
    return this.signalsService.create(createSignalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all signals' })
  @ApiResponse({ status: 200, description: 'Return all signals' })
  findAll(): Promise<Signal[]> {
    return this.signalsService.findAll();
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get signals by device ID' })
  @ApiResponse({ status: 200, description: 'Return signals for device' })
  findByDeviceId(@Param('deviceId') deviceId: string): Promise<Signal[]> {
    return this.signalsService.findByDeviceId(deviceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get signal by ID' })
  @ApiResponse({ status: 200, description: 'Return signal by ID' })
  findOne(@Param('id') id: string): Promise<Signal> {
    return this.signalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update signal by ID' })
  @ApiResponse({ status: 200, description: 'Signal updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateSignalDto: UpdateSignalDto,
  ): Promise<Signal> {
    return this.signalsService.update(id, updateSignalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete signal by ID' })
  @ApiResponse({ status: 200, description: 'Signal deleted successfully' })
  remove(@Param('id') id: string): Promise<Signal> {
    return this.signalsService.remove(id);
  }
}
