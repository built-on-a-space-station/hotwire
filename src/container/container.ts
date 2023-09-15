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
		if (isConstructor(ctorOrToken)) {
			this.addConstructorToken(ctorOrToken, ctorOrToken);
		} else if (isConstructor(ctorOrConfig)) {
			this.addConstructorToken(ctorOrToken, ctorOrConfig);
		} else if (isConfig(ctorOrConfig)) {
			const provider = this.createProviderFromConfig(ctorOrConfig);
			this.registry.add(ctorOrToken, provider);
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
		const dependencies = listInjections(ctor);

		this.registry.add(token, new Provider(ProviderType.Class, ctor));

		this.graph.add(token, dependencies);
	}

	private createProviderFromConfig(config: RegisterConfig) {
		if ('class' in config) {
			return new Provider(ProviderType.Class, config.class, config.lifespan);
		}

		if ('factory' in config) {
			return new Provider(
				ProviderType.Factory,
				config.factory,
				config.lifespan,
			);
		}

		if ('value' in config) {
			return new Provider(ProviderType.Value, config.value, Lifespan.Transient);
		}

		throw new Error(
			'Invalid provider type specified. Must include definition for `class`, `factory` or `value`',
		);
	}
}
