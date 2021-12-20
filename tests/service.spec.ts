import { SignalRConfig } from '@/config';
import {
	HubConnection,
	HubConnectionBuilder,
	IHttpConnectionOptions,
	LogLevel
} from '@microsoft/signalr';
import { SignalRService } from '@/service';

import * as Vue from 'vue';

describe('SignalRService', () => {
	let mockOptions: SignalRConfig;
	let mockBuilder: jasmine.SpyObj<HubConnectionBuilder>;
	let mockConnection: jasmine.SpyObj<HubConnection>;
	let onBeforeUnmountSpy: jasmine.Spy;

	beforeEach(() => {
		mockOptions = { url: 'fake-url' };
		mockConnection = jasmine.createSpyObj([
			'onreconnected',
			'onreconnecting',
			'onclose',
			'start',
			'invoke',
			'send',
			'on',
			'off'
		]);
		mockConnection.start.and.returnValue(Promise.resolve());
		mockConnection.invoke.and.returnValue(new Promise(res => res));

		mockBuilder = jasmine.createSpyObj([
			'withUrl',
			'withAutomaticReconnect',
			'configureLogging',
			'build'
		]);
		mockBuilder.withUrl.and.returnValue(mockBuilder);
		mockBuilder.build.and.returnValue(mockConnection);

		onBeforeUnmountSpy = spyOn(Vue, 'onBeforeUnmount');
	});

	it('should be created', () => {
		const service = new SignalRService(mockOptions, mockBuilder);
		expect(service).toBeTruthy();
	});

	describe('configuration', () => {
		it('should connect to URL from configuration', () => {
			new SignalRService(mockOptions, mockBuilder);
			expect(mockBuilder.withUrl as any).toHaveBeenCalledOnceWith(
				'fake-url',
				jasmine.anything()
			);
		});

		it('should connect to URL from configuration', () => {
			new SignalRService(mockOptions, mockBuilder);
			expect(mockBuilder.withUrl as any).toHaveBeenCalledOnceWith(
				'fake-url',
				jasmine.anything()
			);
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

		it('should pass accessTokenFactory to builder options', () => {
			const factory = () => '<my-access-token>';
			mockOptions.accessTokenFactory = factory;
			new SignalRService(mockOptions, mockBuilder);
			expect(mockBuilder.withUrl).toHaveBeenCalledOnceWith(
				jasmine.any(String),
				jasmine.objectContaining({
					accessTokenFactory: factory
				})
			);
		});

		it('should call disconnect callback on close', () => {
			const disconnectSpy = jasmine.createSpy();
			mockOptions.disconnected = disconnectSpy;
			mockConnection.onclose.and.callFake(callback => {
				callback();

				expect(disconnectSpy).toHaveBeenCalledTimes(1);
			});
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

		it('should allow hooking into the builder', () => {
			mockOptions.prebuild = (
				builder: HubConnectionBuilder,
				_: IHttpConnectionOptions
			) => {
				builder.configureLogging(LogLevel.Information);
			};

			new SignalRService(mockOptions, mockBuilder);
			expect(mockBuilder.configureLogging).toHaveBeenCalledOnceWith(
				LogLevel.Information
			);
		});

		it('should allow configuration of the builder options', () => {
			mockOptions.prebuild = (
				_: HubConnectionBuilder,
				options: IHttpConnectionOptions
			) => {
				options.headers = {
					boop: 'beep'
				};
			};

			new SignalRService(mockOptions, mockBuilder);
			expect(mockBuilder.withUrl).toHaveBeenCalledOnceWith(
				jasmine.any(String),
				jasmine.objectContaining({
					headers: {
						boop: 'beep'
					}
				})
			);
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

		it('should set status to false on close', () => {
			const closeSpy = jasmine.createSpy();

			mockConnection.onclose.and.callFake(callback => {
				closeSpy.and.callFake(() => {
					callback();
					expect(status.value).toBeFalse();
				});
			});

			const service = new SignalRService(mockOptions, mockBuilder);
			const status = service.getConnectionStatus();

			status.value = true;
			closeSpy();
		});

		it('should call disconnect callback on reconnecting', () => {
			const disconnectSpy = jasmine.createSpy();
			mockOptions.disconnected = disconnectSpy;
			mockConnection.onreconnecting.and.callFake(callback => {
				callback();

				expect(disconnectSpy).toHaveBeenCalledTimes(1);
			});

			new SignalRService(mockOptions, mockBuilder);

			expect(mockConnection.onreconnecting).toHaveBeenCalledTimes(1);
		});

		it('should set status to false on reconnecting', () => {
			const reconnectSpy = jasmine.createSpy();

			mockConnection.onreconnecting.and.callFake(callback => {
				reconnectSpy.and.callFake(() => {
					callback();
					expect(status.value).toBeFalse();
				});
			});

			const service = new SignalRService(mockOptions, mockBuilder);
			const status = service.getConnectionStatus();

			status.value = true;
			reconnectSpy();
		});

		it('should call reconnect callback on reconnect', () => {
			const reconnectSpy = jasmine.createSpy();
			mockOptions.reconnected = reconnectSpy;
			mockConnection.onreconnected.and.callFake(callback => {
				callback();

				expect(reconnectSpy).toHaveBeenCalledTimes(1);
			});

			new SignalRService(mockOptions, mockBuilder);

			expect(mockConnection.onreconnected).toHaveBeenCalledTimes(1);
		});

		it('should set status to true on reconnect', () => {
			const reconnectSpy = jasmine.createSpy();

			mockConnection.onreconnected.and.callFake(callback => {
				reconnectSpy.and.callFake(() => {
					callback();
					expect(status.value).toBeTrue();
				});
			});

			const service = new SignalRService(mockOptions, mockBuilder);
			const status = service.getConnectionStatus();

			status.value = false;
			reconnectSpy();
		});
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

		it('should set connection status to true', done => {
			const service = new SignalRService(mockOptions, mockBuilder);
			const connected = service.getConnectionStatus();

			expect(connected.value).toBeFalse();
			service.init();

			setTimeout(() => {
				expect(connected.value).toBeTrue();
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
				expect(mockConnection.invoke).toHaveBeenCalledOnceWith(
					'Command',
					message
				);
				done();
			});
		});

		it('should wait to invoke until after a successful connection', done => {
			service.invoke('Command', message);
			expect(mockConnection.invoke).not.toHaveBeenCalled();

			service.init();
			setTimeout(() => {
				expect(mockConnection.invoke).toHaveBeenCalledOnceWith(
					'Command',
					message
				);
				done();
			});
		});

		it('should invoke without a message', done => {
			service.init();

			setTimeout(() => {
				service.invoke('Command');
				expect(mockConnection.invoke).toHaveBeenCalledOnceWith('Command');
				expect(mockConnection.invoke).not.toHaveBeenCalledWith(
					'Command',
					jasmine.anything
				);
				done();
			});
		});
	});

	describe('send', () => {
		const message = 'We are the champions, my friends';
		let service: SignalRService;

		beforeEach(() => {
			service = new SignalRService(mockOptions, mockBuilder);
		});

		it('should send immediately if connected', done => {
			service.init();

			setTimeout(() => {
				service.send('Command', message);
				expect(mockConnection.send).toHaveBeenCalledOnceWith(
					'Command',
					message
				);
				done();
			});
		});

		it('should wait to send until after a successful connection', done => {
			service.send('Command', message);
			expect(mockConnection.send).not.toHaveBeenCalled();

			service.init();
			setTimeout(() => {
				expect(mockConnection.send).toHaveBeenCalledOnceWith(
					'Command',
					message
				);
				done();
			});
		});

		it('should send without a message', done => {
			service.init();

			setTimeout(() => {
				service.send('Command');
				expect(mockConnection.send).toHaveBeenCalledOnceWith('Command');
				expect(mockConnection.send).not.toHaveBeenCalledWith(
					'Command',
					jasmine.anything
				);
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

		it('should unsubscribe on onmount', () => {
			const callback = () => {};
			onBeforeUnmountSpy.and.callFake(((hook: () => any) => {
				hook();
				expect(mockConnection.off).toHaveBeenCalledOnceWith('Method', callback);
			}) as any);

			service.on('Method', callback);

			expect(onBeforeUnmountSpy).toHaveBeenCalledTimes(1);
		});

		it('should be able to opt out of auto unsubscribe when default is on', () => {
			const callback = () => {};
			mockOptions.automaticUnsubscribe = true;
			onBeforeUnmountSpy.and.callFake(((hook: () => any) => {
				hook();
				expect(mockConnection.off).toHaveBeenCalledOnceWith('Method', callback);
			}) as any);

			service.on('Method', callback, false);

			expect(onBeforeUnmountSpy).not.toHaveBeenCalled();
		});

		it('should be able to disable auto unsubscribe', () => {
			const callback = () => {};
			mockOptions.automaticUnsubscribe = false;
			service = new SignalRService(mockOptions, mockBuilder);
			onBeforeUnmountSpy.and.callFake(((hook: () => any) => {
				hook();
				expect(mockConnection.off).toHaveBeenCalledOnceWith('Method', callback);
			}) as any);

			service.on('Method', callback);

			expect(onBeforeUnmountSpy).not.toHaveBeenCalled();
		});

		it('should be able to opt in to auto unsubscribe when default is off', () => {
			const callback = () => {};
			mockOptions.automaticUnsubscribe = false;
			onBeforeUnmountSpy.and.callFake(((hook: () => any) => {
				hook();
				expect(mockConnection.off).toHaveBeenCalledOnceWith('Method', callback);
			}) as any);

			service.on('Method', callback, true);

			expect(onBeforeUnmountSpy).toHaveBeenCalledTimes(1);
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
