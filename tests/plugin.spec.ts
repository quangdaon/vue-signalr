import { SignalRSymbol } from '@/symbols';
import { useSignalR, VueSignalR } from '@/plugin';
import { SignalRConfig } from '@/config';
import * as Vue from 'vue';
import * as Services from '@/service';

describe('SignalR Vue Plugin', () => {
	let mockApp: jasmine.SpyObj<Vue.App>;
	let mockOptions: SignalRConfig;
	let mockSignalRService: jasmine.SpyObj<Services.SignalRService>;

	beforeEach(() => {
		mockSignalRService = jasmine.createSpyObj(['init']);
		mockApp = jasmine.createSpyObj(['provide']);
		mockOptions = {
			url: 'test-url'
		};

		spyOn(Services, 'SignalRService').and.returnValue(mockSignalRService);
		spyOn(Vue, 'inject').and.returnValue(mockSignalRService);
	});

	it('should be installable', () => {
		expect(() => VueSignalR.install(mockApp, mockOptions)).not.toThrow();
	});

	it('should provide the service', () => {
		VueSignalR.install(mockApp, mockOptions);

		expect(mockApp.provide).toHaveBeenCalledOnceWith(
			SignalRSymbol,
			mockSignalRService
		);
	});

	it('should allow multiple configurations', () => {
		VueSignalR.install(mockApp, [
			{ name: 'hub1', url: 'test-url' },
			{ name: 'hub2', url: 'test-url' }
		]);

		expect(mockApp.provide).toHaveBeenCalledWith('hub1', mockSignalRService);

		expect(mockApp.provide).toHaveBeenCalledWith('hub2', mockSignalRService);

		expect(mockApp.provide).toHaveBeenCalledTimes(2);
	});

	it('should start the service', () => {
		VueSignalR.install(mockApp, mockOptions);

		expect(mockSignalRService.init).toHaveBeenCalledTimes(1);
	});

	it('should expose a composable', () => {
		const service = useSignalR();
		expect(Vue.inject as any).toHaveBeenCalledOnceWith(SignalRSymbol);
		expect(service).toBe(mockSignalRService);
	});

	it('should throw error if service is not injectable', () => {
		(Vue.inject as jasmine.Spy).and.returnValue(undefined);
		expect(() => useSignalR()).toThrowError();
	});
});
