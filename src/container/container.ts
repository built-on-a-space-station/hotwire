import { listInjections } from '../injection/inject';
import { Constructor, Token } from '../types/global';
import { DependencyGraph } from './dependency-graph';
import { Provider, ProviderType } from './provider';
import { Registry } from './registry';
import { Resolution } from './resolution';
import { Lifespan } from './types';

type ClassConfig = { class: Constructor; lifespan?: Lifespan };
type FactoryConfig = { factory: (token: Token) => any; lifespan?: Lifespan };
type ValueConfig = { value: any };

type RegisterConfig = ClassConfig | FactoryConfig | ValueConfig;

const isConfig = (object: unknown): object is RegisterConfig => {
	return (
		!!object &&
		typeof object === 'object' &&
		('class' in object || 'factory' in object || 'value' in object)
	);
};

const isConstructor = (object: unknown): object is Constructor => {
	return (
		!!object &&
		typeof object === 'function' &&
		'constructor' in object &&
		typeof object.constructor === 'function'
	);
};

export class Container {
	private graph = new DependencyGraph();
	private registry = new Registry();
	private singletons: Map<Token, any> = new Map();

	register(ctor: Constructor): void;
	register(token: Token, ctor: Constructor): void;
	register(token: Token, config: RegisterConfig): void;
	register(
		ctorOrToken: Constructor | Token,
		ctorOrConfig?: Constructor | RegisterConfig,
	) {
		if (isConstructor(ctorOrToken) && !ctorOrConfig) {
			this.addConstructorToken(ctorOrToken, ctorOrToken);
		} else if (isConstructor(ctorOrConfig)) {
			this.addConstructorToken(ctorOrToken, ctorOrConfig);
		} else if (isConfig(ctorOrConfig)) {
			this.addConfigToken(ctorOrToken, ctorOrConfig);
		} else {
			throw new Error('Invalid registration attempt');
		}
	}

	get(token: Token) {
		return this.registry.get(token)?.actor;
	}

	resolve<T = any>(token: Token): T {
		const resolution = new Resolution(
			this.registry,
			this.graph,
			this.singletons,
		);

		return resolution.resolve<T>(token);
	}

	private addConstructorToken(token: Token, ctor: Constructor) {
		this.registry.add(token, new Provider(token, ProviderType.Class, ctor));

		this.graph.add(token, listInjections(ctor));
	}

	private addConfigToken(token: Token, config: RegisterConfig) {
		const provider = this.createProviderFromConfig(token, config);

		this.registry.add(token, provider);
		this.graph.add(provider.token, listInjections(provider.actor));

		if (provider.lifespan === Lifespan.Singleton) {
			this.singletons.delete(provider.token);
		}
	}

	private createProviderFromConfig(token: Token, config: RegisterConfig) {
		if ('class' in config) {
			return new Provider(
				token,
				ProviderType.Class,
				config.class,
				config.lifespan,
			);
		}

		if ('factory' in config) {
			return new Provider(
				token,
				ProviderType.Factory,
				config.factory,
				config.lifespan,
			);
		}

		if ('value' in config) {
			return new Provider(
				token,
				ProviderType.Value,
				config.value,
				Lifespan.Singleton,
			);
		}

		throw new Error(
			'Invalid provider type specified. Must include definition for `class`, `factory` or `value`',
		);
	}
}
