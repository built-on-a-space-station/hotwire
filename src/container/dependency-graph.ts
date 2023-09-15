import { Token } from '../types/global';

export class DependencyGraph {
	private dependencies = new Map<Token, Token[]>();

	add(token: Token, deps: Token[]): void {
		this.dependencies.set(token, deps);
	}

	get(token: Token): Token[] {
		return this.dependencies.get(token) || [];
	}
}
