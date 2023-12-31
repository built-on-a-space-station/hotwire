import { Token } from '../types/global';
import { Provider } from './provider';

export class Registry {
	providers: Map<Token, Provider> = new Map();

	add(token: Token, provider: Provider) {
		this.providers.set(token, provider);
	}

	get(token: Token) {
		return this.providers.get(token);
	}
}
