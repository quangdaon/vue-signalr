import * as Exports from '@/index';
import { SignalRSymbol } from '@/symbols';
import { SignalRService } from '@/service';
import { VueSignalR, useSignalR } from '@/plugin';

describe('public exports', () => {
	it('should export public members', () => {
		expect(Exports.VueSignalR).toBe(VueSignalR);
		expect(Exports.useSignalR).toBe(useSignalR);
		expect(Exports.SignalRService).toBe(SignalRService);
		expect(Exports.SignalRSymbol).toBe(SignalRSymbol);
	});
});
