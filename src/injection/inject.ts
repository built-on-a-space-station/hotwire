import { Constructor, Token } from '../types/global';
import { InjectionSym } from './static';

export const inject = (ctor: Constructor, tokens: Token[] = []) => {
	Object.assign(ctor, { [InjectionSym]: tokens });
};

export const listInjections = (entity: any): Token[] => {
	if (!!entity && typeof entity === 'function' && InjectionSym in entity) {
		return entity[InjectionSym] as Token[];
	}

	return [];
};
