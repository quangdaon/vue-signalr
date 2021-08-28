import { SignalRConfig } from './../src/models/SignalRConfig';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { SignalRService } from '@/service';

describe('SignalRService', () => {
	let mockOptions: SignalRConfig;
	let mockBuilder: jasmine.SpyObj<HubConnectionBuilder>;
	let mockConnection: jasmine.SpyObj<HubConnection>;

	beforeEach(() => {
		mockOptions = { url: 'fake-url' };
		mockConnection = jasmine.createSpyObj(['onclose', 'start']);
		mockConnection.start.and.returnValue(Promise.resolve());

		mockBuilder = jasmine.createSpyObj(['withUrl', 'build']);
		mockBuilder.withUrl.and.returnValue(mockBuilder);
		mockBuilder.build.and.returnValue(mockConnection);
	});

	it('should be created', () => {
		const service = new SignalRService(mockOptions, mockBuilder);
		expect(service).toBeTruthy();
	});

	it('should connect to URL from configuration', () => {
		new SignalRService(mockOptions, mockBuilder);
		expect(mockBuilder.withUrl as any).toHaveBeenCalledOnceWith('fake-url');
	});

	it('should call disconnect callback on close', () => {
		const disconnectSpy = jasmine.createSpy();
		mockOptions.disconnected = disconnectSpy;
		mockConnection.onclose.and.callFake(callback => {
			callback();

			expect(disconnectSpy).toHaveBeenCalledTimes(1);
		});

		new SignalRService(mockOptions, mockBuilder);

		expect(mockConnection.onclose).toHaveBeenCalledTimes(1);
	});

	it('should call fail silently on close if no disconnect callback', () => {
		mockOptions.disconnected = undefined;
		mockConnection.onclose.and.callFake(callback => {
			callback();
		});

		expect(() => new SignalRService(mockOptions, mockBuilder)).not.toThrow();
	});

	describe('init', () => {
		it('should start the connection', () => {
			const service = new SignalRService(mockOptions, mockBuilder);
			service.init();

			expect(mockConnection.start).toHaveBeenCalledTimes(1);
		});

		it('should call disconnect callback when connection fails', done => {
			const disconnectSpy = jasmine.createSpy();
			mockOptions.disconnected = disconnectSpy;
			mockConnection.start.and.returnValue(Promise.reject());

			const service = new SignalRService(mockOptions, mockBuilder);
			service.init();

			setTimeout(() => {
				expect(disconnectSpy).toHaveBeenCalledTimes(1);
				done();
			});
		});
	});
});
