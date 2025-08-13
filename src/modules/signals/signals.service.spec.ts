import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SignalsService } from './signals.service';
import { Signal } from './schemas/signal.schema';
import { CreateSignalDto } from '../../common/dto';

describe('SignalsService', () => {
  let service: SignalsService;
  let mockSignalModel: any;

  const mockSignal = {
    deviceId: 'test-device',
    timestamp: 1735683480000,
    dataLength: 3,
    dataVolume: 150,
    data: [
      {
        time: 762,
        coordinates: [51.339764, 12.339223833333334, 1.2038000000000002] as [
          number,
          number,
          number,
        ],
      },
      {
        time: 1766,
        coordinates: [51.33977733333333, 12.339211833333334, 1.531604] as [
          number,
          number,
          number,
        ],
      },
      {
        time: 2763,
        coordinates: [51.339782, 12.339196166666667, 2.13906] as [
          number,
          number,
          number,
        ],
      },
    ],
  };

  beforeEach(async () => {
    mockSignalModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSignal),
    }));
    mockSignalModel.find = jest.fn();
    mockSignalModel.findById = jest.fn();
    mockSignalModel.findByIdAndUpdate = jest.fn();
    mockSignalModel.findByIdAndDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: getModelToken(Signal.name),
          useValue: mockSignalModel,
        },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new signal', async () => {
      const createSignalDto: CreateSignalDto = mockSignal;

      const result = await service.create(createSignalDto);
      expect(result).toEqual(mockSignal);
      expect(mockSignalModel).toHaveBeenCalledWith(createSignalDto);
    });
  });

  describe('findAll', () => {
    it('should return all signals', async () => {
      const mockSignals = [mockSignal];
      mockSignalModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSignals),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockSignals);
    });
  });

  describe('processXrayData', () => {
    it('should process x-ray data correctly', async () => {
      const xrayMessage = {
        '66bb584d4ae73e488c30a072': {
          data: [
            [762, [51.339764, 12.339223833333334, 1.2038000000000002]],
            [1766, [51.33977733333333, 12.339211833333334, 1.531604]],
            [2763, [51.339782, 12.339196166666667, 2.13906]],
          ],
          time: 1735683480000,
        },
      };

      const result = await service.processXrayData(xrayMessage);

      expect(result.deviceId).toBe('66bb584d4ae73e488c30a072');
      expect(result.timestamp).toBe(1735683480000);
      expect(result.dataLength).toBe(3);
      expect(result.dataVolume).toBeGreaterThan(0);
      expect(result.data).toHaveLength(3);
    });
  });
});
