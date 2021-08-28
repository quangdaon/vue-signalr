import { SignalRConfig } from '@/config';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { SignalRService } from '@/service';

describe('SignalRService', () => {
	let mockOptions: SignalRConfig;
	let mockBuilder: jasmine.SpyObj<HubConnectionBuilder>;
	let mockConnection: jasmine.SpyObj<HubConnection>;

	beforeEach(() => {
		mockOptions = { url: 'fake-url' };
		mockConnection = jasmine.createSpyObj([
			'onclose',
			'start',
			'invoke',
			'on',
			'off'
		]);
		mockConnection.start.and.returnValue(Promise.resolve());
		mockConnection.invoke.and.returnValue(new Promise(res => res));

		mockBuilder = jasmine.createSpyObj(['withUrl', 'withAutomaticReconnect', 'build']);
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

	it('should not enable automatic reconnections by default', () => {
		new SignalRService(mockOptions, mockBuilder);
		expect(mockBuilder.withAutomaticReconnect).not.toHaveBeenCalled();
	});

	it('should enable automatic reconnections', () => {
		mockOptions.automaticReconnect = true;
		new SignalRService(mockOptions, mockBuilder);
		expect(mockBuilder.withAutomaticReconnect).toHaveBeenCalledTimes(1);
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

	describe('connectionSuccess', () => {
		let callback: jasmine.Spy;
		let service: SignalRService;

		beforeEach(() => {
			callback = jasmine.createSpy();
			service = new SignalRService(mockOptions, mockBuilder);
		});

		it('should call callback immediately if connected', done => {
			service.init();

			setTimeout(() => {
				service.connectionSuccess(callback);
				expect(callback).toHaveBeenCalledTimes(1);
				done();
			});
		});

		it('should call callback after connection', done => {
			service.connectionSuccess(callback);
			expect(callback).not.toHaveBeenCalled();

			service.init();

			setTimeout(() => {
				expect(callback).toHaveBeenCalledTimes(1);
				done();
			});
		});
	});

	describe('invoke', () => {
		const message = `Hey ho, let's go!`;
		let service: SignalRService;

		beforeEach(() => {
			service = new SignalRService(mockOptions, mockBuilder);
		});

		it('should invoke immediately if connected', done => {
			service.init();

			setTimeout(() => {
				service.invoke('Command', message);
				expect(mockConnection.invoke).toHaveBeenCalledWith('Command', message);
				done();
			});
		});

		it('should wait to invoke until after a successful connection', done => {
			service.invoke('Command', message);
			expect(mockConnection.invoke).not.toHaveBeenCalled();

			service.init();
			setTimeout(() => {
				expect(mockConnection.invoke).toHaveBeenCalledWith('Command', message);
				done();
			});
		});
	});

	describe('on', () => {
		let service: SignalRService;

		beforeEach(() => {
			service = new SignalRService(mockOptions, mockBuilder);
		});

		it('should call connection on method', () => {
			const callback = () => {};
			service.on('Method', callback);

			expect(mockConnection.on).toHaveBeenCalledOnceWith('Method', callback);
		});
	});

	describe('off', () => {
		let service: SignalRService;

		beforeEach(() => {
			service = new SignalRService(mockOptions, mockBuilder);
		});

		it('should call connection off method', () => {
			const callback = () => {};
			service.off('Method', callback);

			expect(mockConnection.off).toHaveBeenCalledOnceWith('Method', callback);
		});

		it('should allow no callback', () => {
			service.off('Method');

			expect(mockConnection.off as any).toHaveBeenCalledOnceWith('Method');
		});
	});
});
