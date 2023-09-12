import { Provider, ProviderType } from './provider';
import { Registry } from './registry';
import { Constructor, Lifespan, Token } from './types';

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
	private registry = new Registry();

	register(ctor: Constructor): void;
	register(token: Token, ctor: Constructor): void;
	register(ctorOrToken: Constructor | Token, ctorOrConfig?: Constructor) {
		if (isConstructor(ctorOrToken)) {
			this.registry.add(
				ctorOrToken,
				new Provider(ProviderType.Class, ctorOrToken),
			);
		} else if (isConstructor(ctorOrConfig)) {
			this.registry.add(
				ctorOrToken,
				new Provider(ProviderType.Class, ctorOrConfig),
			);
		} else if (isConfig(ctorOrConfig)) {
			const provider = this.getProvider(ctorOrConfig);
			this.registry.add(ctorOrToken, provider);
		} else {
			throw new Error('Invalid registration attempt');
		}
	}

	get(token: Token) {
		return this.registry.get(token);
	}

	private getProvider(config: RegisterConfig) {
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
			return new Provider(
				ProviderType.Factory,
				config.value,
				Lifespan.Singleton,
			);
		}

		throw new Error(
			'Invalid provider type specified. Must include definition for `class`, `factory` or `value`',
		);
	}
}
