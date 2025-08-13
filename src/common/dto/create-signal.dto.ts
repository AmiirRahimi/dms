import { IsString, IsNumber, IsArray, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class XrayDataPointDto {
  @IsNumber()
  time: number;

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: [number, number, number];
}

export class CreateSignalDto {
  @IsString()
  deviceId: string;

  @IsNumber()
  timestamp: number;

  @IsNumber()
  dataLength: number;

  @IsNumber()
  dataVolume: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => XrayDataPointDto)
  data: XrayDataPointDto[];
}
