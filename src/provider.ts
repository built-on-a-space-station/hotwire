export enum ProviderType {
	Class,
	Factory,
	Value,
}

export class Provider {
	constructor(
		public type: ProviderType,
		public actor: any,
	) {}
}
