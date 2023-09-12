import { inject, listInjections } from '../inject';

it('applies injection tokens to a constructor', () => {
	class A {}

	inject(A, ['a', 'b']);

	expect(listInjections(A)).toEqual(['a', 'b']);
});
