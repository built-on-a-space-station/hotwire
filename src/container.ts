import { Provider, ProviderType } from './provider';
import { Registry } from './registry';
import { Constructor, Lifespan, Token } from './types';

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
	register(ctorOrToken: Constructor | Token, ctor?: Constructor) {
		if (isConstructor(ctorOrToken)) {
			this.registry.add(
				ctorOrToken,
				new Provider(ProviderType.Class, ctorOrToken),
			);
		} else if (isConstructor(ctor)) {
			this.registry.add(ctorOrToken, new Provider(ProviderType.Class, ctor));
		}
	}

	get(token: Token) {
		return this.registry.get(token);
	}
}
