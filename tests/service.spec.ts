import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { SignalRService } from '../src/service';

describe('SignalRService', () => {
	let service: SignalRService;
	let mockBuilder: jasmine.SpyObj<HubConnectionBuilder>;
	let mockConnection: jasmine.SpyObj<HubConnection>;

	beforeEach(() => {
		mockConnection = jasmine.createSpyObj(['onclose']);

		mockBuilder = jasmine.createSpyObj(['withUrl', 'build']);
		mockBuilder.withUrl.and.returnValue(mockBuilder);
		mockBuilder.build.and.returnValue(mockConnection);

		service = new SignalRService({ url: 'fake-url' }, mockBuilder);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
