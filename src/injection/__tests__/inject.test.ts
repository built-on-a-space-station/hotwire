import { inject, listInjections } from '../inject';

it('applies injection tokens to a constructor', () => {
	class A {}

	inject(A, ['a', 'b']);

	expect(listInjections(A)).toEqual(['a', 'b']);
});

it.each([1, 'a', {}, null])(
	'returns an empty array if no injections are found',
	(entity) => {
		expect(listInjections(entity)).toEqual([]);
	},
);
