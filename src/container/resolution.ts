import { Token } from '../types/global';
import { DependencyGraph } from './dependency-graph';
import { Provider, ProviderType } from './provider';
import { Registry } from './registry';
import { Lifespan } from './types';

export class Resolution {
	private resolutions = new Map<Token, any>();
	private current = new Map<Token, any>();

	constructor(
		private registry: Registry,
		private graph: DependencyGraph,
		private singletons: Map<Token, any>,
	) {}

	resolve<T = any>(token: Token): T {
		return this.ensureResult(token);
	}

	private getSource(lifespan: Lifespan) {
		switch (lifespan) {
			case Lifespan.Resolution:
				return this.resolutions;

			case Lifespan.Singleton:
				return this.singletons;

			default:
				return null;
		}
	}

	private ensureResult(token: Token) {
		const provider = this.registry.get(token);

		if (!provider) {
			throw new Error(`No provider registered for token: ${String(token)}`);
		}

		const source = this.getSource(provider.lifespan);

		if (source && source.has(provider.token)) {
			return source.get(provider.token);
		}

		let value;

		switch (provider.type) {
			case ProviderType.Value:
				value = provider.actor;
				break;

			case ProviderType.Factory:
				value = provider.actor(provider.token);
				break;

			case ProviderType.Class:
				value = this.ensureClassResult(provider);
		}

		if (source) {
			source.set(token, value);
		}

		return value;
	}

	private ensureClassResult(provider: Provider) {
		const source = this.getSource(provider.lifespan);

		const injectTokens = this.graph.get(provider.token);
		const injects: any[] = [];

		for (const inject of injectTokens) {
			const value = this.ensureResult(inject);
			injects.push(value);
			this.current.delete(inject);
		}

		const instance = new provider.actor(...injects);

		if (source) {
			source.set(provider.token, instance);
		}

		return instance;
	}
}
