import { Token } from '../types/global';
import { Container } from './container';
import { DependencyGraph } from './dependency-graph';
import { ProviderType } from './provider';
import { Registry } from './registry';

export class Resolution {
	private resolutions: Map<Token, any> = new Map();

	constructor(
		private registry: Registry,
		private graph: DependencyGraph,
		private singletons: Map<Token, any>,
	) {}

	resolve<T = any>(token: Token): T {
		const provider = this.registry.get(token);

		if (!provider) {
			throw new Error(`No provider registered for token: ${String(token)}`);
		}

		if (provider.type === ProviderType.Class) {
			const manifest = this.graph.createManifestFor(token);

			const current: Map<Token, any> = new Map();

			return new provider.actor() as T;
		}

		if (provider.type === ProviderType.Factory) {
			return provider.actor(token) as T;
		}

		if (provider.type === ProviderType.Value) {
			return provider.actor as T;
		}

		throw new Error('Working on it');
	}

	private getResolvedProvider(token: Token) {
		// check in the registry
		// if singleton, check if exists
		// if resolutions, check if exists
		// otherwise make new value
	}
}
