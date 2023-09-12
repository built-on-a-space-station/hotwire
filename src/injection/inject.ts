import { Constructor, Token } from '../types/global';
import { InjectionSym } from './static';

export const inject = (ctor: Constructor, tokens: Token[] = []) => {
	Object.assign(ctor, { [InjectionSym]: tokens });
};

export const listInjections = (ctor: Constructor): Token[] => {
	if (!(InjectionSym in ctor)) {
		return [];
	}

	return ctor[InjectionSym] as Token[];
};
