import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { SignalsService } from './signals.service';
import { CreateSignalDto, UpdateSignalDto } from '../../common/dto';
import { Signal } from './schemas/signal.schema';
import { CustomValidationPipe } from '../../common/pipes/validation.pipe';

@ApiTags('signals')
@Controller('signals')
@UsePipes(CustomValidationPipe)
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new signal' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Signal created successfully',
    type: Signal 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Database error' 
  })
  @ApiBody({ type: CreateSignalDto })
  create(@Body() createSignalDto: CreateSignalDto): Promise<Signal> {
    return this.signalsService.create(createSignalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all signals' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Return all signals',
    type: [Signal]
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Database error' 
  })
  findAll(): Promise<Signal[]> {
    return this.signalsService.findAll();
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get signals by device ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Return signals for device',
    type: [Signal]
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid device ID' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Database error' 
  })
  @ApiParam({ name: 'deviceId', description: 'Device ID', type: 'string' })
  findByDeviceId(@Param('deviceId') deviceId: string): Promise<Signal[]> {
    return this.signalsService.findByDeviceId(deviceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get signal by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Return signal by ID',
    type: Signal
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid signal ID' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Signal not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Database error' 
  })
  @ApiParam({ name: 'id', description: 'Signal ID', type: 'string' })
  findOne(@Param('id') id: string): Promise<Signal> {
    return this.signalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update signal by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Signal updated successfully',
    type: Signal
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Signal not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Database error' 
  })
  @ApiParam({ name: 'id', description: 'Signal ID', type: 'string' })
  @ApiBody({ type: UpdateSignalDto })
  update(
    @Param('id') id: string,
    @Body() updateSignalDto: UpdateSignalDto,
  ): Promise<Signal> {
    return this.signalsService.update(id, updateSignalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete signal by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Signal deleted successfully',
    type: Signal
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid signal ID' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Signal not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Database error' 
  })
  @ApiParam({ name: 'id', description: 'Signal ID', type: 'string' })
  remove(@Param('id') id: string): Promise<Signal> {
    return this.signalsService.remove(id);
  }
}
