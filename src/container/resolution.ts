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
		const provider = this.registry.get(token);

		if (!provider) {
			throw new Error(`No provider registered for token: ${String(token)}`);
		}

		const source = this.getSource(provider.lifespan);

		if (provider.type === ProviderType.Value) {
			return provider.actor;
		}

		if (provider.type === ProviderType.Factory) {
			this.ensureFactoryResult(token, provider);

			return source.get(token);
		}

		if (provider.type === ProviderType.Class) {
			const manifest = this.graph.createManifestFor(token);

			for (const token of manifest) {
				const provider = this.registry.get(token);

				if (!provider) {
					continue;
				}

				if (provider.type === ProviderType.Value) {
					this.current.set(token, provider.actor);
				} else if (provider.type === ProviderType.Factory) {
					this.ensureFactoryResult(token, provider);
				} else {
					this.ensureClassResult(token, provider);
				}
			}

			return source.get(token);
		}

		throw new Error('Working on it');
	}

	private ensureFactoryResult(token: Token, provider: Provider) {
		const source = this.getSource(provider.lifespan);

		if (!source.has(token)) {
			source.set(token, provider.actor(token));
		}
	}

	private ensureClassResult(token: Token, provider: Provider) {
		const source = this.getSource(provider.lifespan);

		if (source.has(token)) {
			return source.get(token);
		}

		const injectTokens = this.graph.get(token);
		const injects: any[] = [];

		for (const inject of injectTokens) {
			injects.push(this.getInject(inject));
			this.current.delete(inject);
		}

		const instance = new provider.actor(...injects);

		source.set(token, instance);

		return instance;
	}

	private getSource(lifespan: Lifespan) {
		switch (lifespan) {
			case Lifespan.Resolution:
				return this.resolutions;

			case Lifespan.Singleton:
				return this.singletons;

			default:
				return this.current;
		}
	}

	private getInject(token: Token) {
		const provider = this.registry.get(token);

		const source = this.getSource(provider!.lifespan);

		return source.get(token);
	}
}
