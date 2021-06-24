import { SignalRService } from "./service";
import { InjectionKey } from "vue";

export const SignalRSymbol: InjectionKey<SignalRService> = Symbol('SignalRService');
