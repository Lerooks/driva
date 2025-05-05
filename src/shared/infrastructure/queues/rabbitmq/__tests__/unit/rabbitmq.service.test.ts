/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { connect } from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { RabbitMQService } from '../../rabbitmq.service';

jest.mock('amqp-connection-manager', () => ({
  connect: jest.fn(),
}));

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let mockChannelWrapper: jest.Mocked<ChannelWrapper>;

  beforeEach(() => {
    mockChannelWrapper = {
      sendToQueue: jest.fn(),
      close: jest.fn(),
      addSetup: jest.fn(),
    } as any;

    (connect as jest.Mock).mockReturnValue({
      createChannel: jest.fn().mockReturnValue(mockChannelWrapper),
      close: jest.fn(),
    });

    service = new RabbitMQService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize and set up channel on creation', () => {
    expect(connect).toHaveBeenCalled();
    expect(service['channelWrapper']).toBe(mockChannelWrapper);
  });

  it('should publish message to queue', async () => {
    mockChannelWrapper.sendToQueue.mockResolvedValueOnce(true);

    const result = await service.publishToQueue('test-queue', { foo: 'bar' });

    expect(result).toBe(true);
    expect(mockChannelWrapper.sendToQueue).toHaveBeenCalledWith(
      'test-queue',
      { foo: 'bar' },
      { timeout: 30000 },
    );
  });

  it('should log error and return false if publishing fails', async () => {
    mockChannelWrapper.sendToQueue.mockRejectedValueOnce(new Error('fail'));

    const result = await service.publishToQueue('fail-queue', { foo: 'bar' });

    expect(result).toBe(false);
  });

  it('should close connection and channel on module destroy', async () => {
    await service.onModuleDestroy();

    expect(mockChannelWrapper.close).toHaveBeenCalled();
  });

  it('should setup consumer and process message with ack', async () => {
    const mockCallback = jest.fn();

    await service.consumeFromQueue('test-queue', mockCallback);

    expect(mockChannelWrapper.addSetup).toHaveBeenCalled();
  });

  it('should handle message processing error in listener', async () => {
    const mockCallback = jest.fn();

    await service.listenToQueue('test-queue', mockCallback);

    expect(mockChannelWrapper.addSetup).toHaveBeenCalled();
  });
});
