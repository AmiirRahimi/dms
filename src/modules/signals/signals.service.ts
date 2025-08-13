import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Signal, SignalDocument } from './schemas/signal.schema';
import { ProcessedXrayData } from '../../common/interfaces/xray-data.interface';
import { CreateSignalDto, UpdateSignalDto } from 'src/common/dto';

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    @InjectModel(Signal.name) private signalModel: Model<SignalDocument>,
  ) {}

  async create(createSignalDto: CreateSignalDto): Promise<Signal> {
    const createdSignal = new this.signalModel(createSignalDto);
    return createdSignal.save();
  }

  async findAll(): Promise<Signal[]> {
    return this.signalModel.find().exec();
  }

  async findOne(id: string): Promise<Signal> {
    return this.signalModel.findById(id).exec();
  }

  async findByDeviceId(deviceId: string): Promise<Signal[]> {
    return this.signalModel.find({ deviceId }).exec();
  }

  async update(id: string, updateSignalDto: UpdateSignalDto): Promise<Signal> {
    return this.signalModel
      .findByIdAndUpdate(id, updateSignalDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Signal> {
    return this.signalModel.findByIdAndDelete(id).exec();
  }

  async processXrayData(xrayMessage: any): Promise<ProcessedXrayData> {
    const deviceId = Object.keys(xrayMessage)[0];
    const data = xrayMessage[deviceId];

    const processedData: ProcessedXrayData = {
      deviceId,
      timestamp: data.time,
      dataLength: data.data.length,
      dataVolume: JSON.stringify(data.data).length,
      data: data.data.map((point: any) => ({
        time: point[0],
        coordinates: point[1],
      })),
    };

    return processedData;
  }

  async saveProcessedData(processedData: ProcessedXrayData): Promise<Signal> {
    try {
      const signal = new this.signalModel(processedData);
      const savedSignal = await signal.save();
      this.logger.log(`Signal saved for device: ${processedData.deviceId}`);
      return savedSignal;
    } catch (error) {
      this.logger.error(`Error saving signal: ${error.message}`);
      throw error;
    }
  }
}
