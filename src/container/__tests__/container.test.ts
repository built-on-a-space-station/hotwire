import { Container } from '../container';

it('registers a class provider', () => {
	class A {}

	const container = new Container();

	container.register(A);

	expect(container.get(A)).toBe(A);
});

it('registers with a custom token', () => {
	class A {}

	const container = new Container();

	container.register('A', A);

	expect(container.get('A')).toBe(A);
	expect(container.get(A)).toBeUndefined();
});
