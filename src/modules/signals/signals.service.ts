import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Signal, SignalDocument } from './schemas/signal.schema';
import { ProcessedXrayData } from '../../common/interfaces/xray-data.interface';
import { CreateSignalDto, UpdateSignalDto } from 'src/common/dto';
import { 
  DatabaseException, 
  DataProcessingException, 
  ResourceNotFoundException 
} from '../../common/exceptions/custom-exceptions';

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    @InjectModel(Signal.name) private signalModel: Model<SignalDocument>,
  ) {}

  async create(createSignalDto: CreateSignalDto): Promise<Signal> {
    try {
      this.logger.log(`Creating signal for device: ${createSignalDto.deviceId}`);
      
      // Validate required fields
      if (!createSignalDto.deviceId || !createSignalDto.timestamp) {
        throw new BadRequestException('Device ID and timestamp are required');
      }

      const createdSignal = new this.signalModel(createSignalDto);
      const savedSignal = await createdSignal.save();
      
      this.logger.log(`Signal created successfully with ID: ${savedSignal._id}`);
      return savedSignal;
    } catch (error) {
      this.logger.error(`Error creating signal: ${error.message}`, error.stack);
      
      if (error.code === 11000) {
        throw new DatabaseException('Signal with this device ID and timestamp already exists');
      }
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new DatabaseException('Failed to create signal', error);
    }
  }

  async findAll(): Promise<Signal[]> {
    try {
      this.logger.log('Fetching all signals');
      const signals = await this.signalModel.find().exec();
      this.logger.log(`Found ${signals.length} signals`);
      return signals;
    } catch (error) {
      this.logger.error(`Error fetching all signals: ${error.message}`, error.stack);
      throw new DatabaseException('Failed to fetch signals', error);
    }
  }

  async findOne(id: string): Promise<Signal> {
    try {
      this.logger.log(`Fetching signal with ID: ${id}`);
      
      if (!id || id.trim() === '') {
        throw new BadRequestException('Signal ID is required');
      }

      const signal = await this.signalModel.findById(id).exec();
      
      if (!signal) {
        throw new ResourceNotFoundException('Signal', id);
      }
      
      this.logger.log(`Signal found: ${signal._id}`);
      return signal;
    } catch (error) {
      this.logger.error(`Error fetching signal with ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof ResourceNotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new DatabaseException('Failed to fetch signal', error);
    }
  }

  async findByDeviceId(deviceId: string): Promise<Signal[]> {
    try {
      this.logger.log(`Fetching signals for device: ${deviceId}`);
      
      if (!deviceId || deviceId.trim() === '') {
        throw new BadRequestException('Device ID is required');
      }

      const signals = await this.signalModel.find({ deviceId }).exec();
      this.logger.log(`Found ${signals.length} signals for device: ${deviceId}`);
      return signals;
    } catch (error) {
      this.logger.error(`Error fetching signals for device ${deviceId}: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new DatabaseException('Failed to fetch signals for device', error);
    }
  }

  async update(id: string, updateSignalDto: UpdateSignalDto): Promise<Signal> {
    try {
      this.logger.log(`Updating signal with ID: ${id}`);
      
      if (!id || id.trim() === '') {
        throw new BadRequestException('Signal ID is required');
      }

      if (!updateSignalDto || Object.keys(updateSignalDto).length === 0) {
        throw new BadRequestException('Update data is required');
      }

      const updatedSignal = await this.signalModel
        .findByIdAndUpdate(id, updateSignalDto, { new: true })
        .exec();
      
      if (!updatedSignal) {
        throw new ResourceNotFoundException('Signal', id);
      }
      
      this.logger.log(`Signal updated successfully: ${updatedSignal._id}`);
      return updatedSignal;
    } catch (error) {
      this.logger.error(`Error updating signal with ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof ResourceNotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new DatabaseException('Failed to update signal', error);
    }
  }

  async remove(id: string): Promise<Signal> {
    try {
      this.logger.log(`Deleting signal with ID: ${id}`);
      
      if (!id || id.trim() === '') {
        throw new BadRequestException('Signal ID is required');
      }

      const deletedSignal = await this.signalModel.findByIdAndDelete(id).exec();
      
      if (!deletedSignal) {
        throw new ResourceNotFoundException('Signal', id);
      }
      
      this.logger.log(`Signal deleted successfully: ${deletedSignal._id}`);
      return deletedSignal;
    } catch (error) {
      this.logger.error(`Error deleting signal with ID ${id}: ${error.message}`, error.stack);
      
      if (error instanceof ResourceNotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new DatabaseException('Failed to delete signal', error);
    }
  }

  async processXrayData(xrayMessage: any): Promise<ProcessedXrayData> {
    try {
      this.logger.log('Processing X-ray data');
      
      if (!xrayMessage || typeof xrayMessage !== 'object') {
        throw new DataProcessingException('Invalid X-ray message format');
      }

      const deviceIds = Object.keys(xrayMessage);
      if (deviceIds.length === 0) {
        throw new DataProcessingException('No device ID found in X-ray message');
      }

      const deviceId = deviceIds[0];
      const data = xrayMessage[deviceId];

      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new DataProcessingException('Invalid data structure in X-ray message');
      }

      if (!data.time || typeof data.time !== 'number') {
        throw new DataProcessingException('Invalid timestamp in X-ray message');
      }

      // Validate data points
      const validatedData = data.data.map((point: any, index: number) => {
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

        return {
          time: point[0],
          coordinates: point[1],
        };
      });

      const processedData: ProcessedXrayData = {
        deviceId,
        timestamp: data.time,
        dataLength: validatedData.length,
        dataVolume: JSON.stringify(validatedData).length,
        data: validatedData,
      };

      this.logger.log(`X-ray data processed successfully for device: ${deviceId}`);
      return processedData;
    } catch (error) {
      this.logger.error(`Error processing X-ray data: ${error.message}`, error.stack);
      
      if (error instanceof DataProcessingException) {
        throw error;
      }
      
      throw new DataProcessingException('Failed to process X-ray data', error);
    }
  }

  async saveProcessedData(processedData: ProcessedXrayData): Promise<Signal> {
    try {
      this.logger.log(`Saving processed data for device: ${processedData.deviceId}`);
      
      if (!processedData || !processedData.deviceId) {
        throw new BadRequestException('Processed data is missing required fields');
      }

      const signal = new this.signalModel(processedData);
      const savedSignal = await signal.save();
      
      this.logger.log(`Signal saved successfully for device: ${processedData.deviceId} with ID: ${savedSignal._id}`);
      return savedSignal;
    } catch (error) {
      this.logger.error(`Error saving processed data: ${error.message}`, error.stack);
      
      if (error.code === 11000) {
        throw new DatabaseException('Signal with this device ID and timestamp already exists');
      }
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new DatabaseException('Failed to save processed data', error);
    }
  }
}
