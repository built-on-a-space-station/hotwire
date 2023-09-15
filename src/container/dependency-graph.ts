import { Token } from '../types/global';

export class DependencyGraph {
	private dependencies = new Map<Token, Token[]>();

	add(token: Token, deps: Token[]): void {
		this.dependencies.set(token, deps);
	}

	get(token: Token): Token[] {
		return this.dependencies.get(token) || [];
	}

	createManifestFor(token: Token): Token[] {
		const manifest: Token[] = [];
		const current: Token[] = [];
		const next = new Set([token]);

		do {
			current.length = 0;
			current.push(...next);
			manifest.push(...next);

			next.clear();

			for (const token of current) {
				const deps = this.dependencies.get(token);

				if (deps) {
					deps.forEach((item) => next.add(item));
				}
			}
		} while (next.size);

		const ordered = manifest.reverse();

		return [...new Set(ordered)];
	}
}
