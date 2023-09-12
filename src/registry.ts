import { Provider } from './provider';
import { Token } from './types';

export class Registry {
	providers: Map<Token, Provider> = new Map();

	add(token: Token, provider: Provider) {
		this.providers.set(token, provider);
	}

	get(token: Token) {
		const provider = this.providers.get(token);

		return provider?.actor;
	}
}
