import { Token } from '../types/global';
import { Lifespan } from './types';

export enum ProviderType {
	Class,
	Factory,
	Value,
}

export class Provider {
	constructor(
		public token: Token,
		public type: ProviderType,
		public actor: any,
		public lifespan = Lifespan.Transient,
	) {}
}
