import { Token } from '../types/global';

export class DependencyGraph {
	private dependencies = new Map<Token, Token[]>();

	add(token: Token, deps: Token[]) {
		this.dependencies.set(token, deps);
	}

	createManifestFor(token: Token) {
		const manifest: Token[][] = [];

		let currentLevel: Token[] = [];
		let nextLevel: Token[] = [token];

		do {
			currentLevel = nextLevel;
			nextLevel = [];

			manifest[manifest.length] = [];

			manifest[manifest.length - 1] = currentLevel;

			for (const token of currentLevel) {
				const deps = this.dependencies.get(token) || [];

				nextLevel.push(...deps);
			}

			nextLevel = [...new Set(nextLevel)];
		} while (nextLevel.length);

		const ordered = manifest.reverse();

		ordered.forEach((level, index, manifest) => {
			for (const token of level) {
				for (let i = index + 1; i < manifest.length; i++) {
					const searchLevel = manifest[i];
					const tokenIndex = searchLevel.findIndex((tok) => tok === token);

					if (tokenIndex !== -1) {
						searchLevel.splice(tokenIndex, 1);
					}
				}
			}
		});

		return ordered;
	}
}
