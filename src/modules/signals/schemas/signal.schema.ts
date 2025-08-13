import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SignalDocument = Signal & Document;

@Schema({ timestamps: true })
export class Signal {
  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true, index: true })
  timestamp: number;

  @Prop({ required: true })
  dataLength: number;

  @Prop({ required: true })
  dataVolume: number;

  @Prop({ type: Array, required: true })
  data: Array<{
    time: number;
    coordinates: [number, number, number];
  }>;
}

export const SignalSchema = SchemaFactory.createForClass(Signal);
