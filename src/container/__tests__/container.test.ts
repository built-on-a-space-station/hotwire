import { inject, listInjections } from '../../injection';
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

it('resolves a class instance', () => {
	class A {}

	const container = new Container();

	container.register(A);

	const a = container.resolve(A);

	expect(a).toBeInstanceOf(A);
});

it('resolves a factory instance', () => {
	const f = () => 'tory';

	const container = new Container();

	container.register('fac', { factory: f });

	const a = container.resolve('fac');

	expect(a).toBe('tory');
});

it('resolves a value', () => {
	const container = new Container();

	container.register('v', { value: 'value' });

	const a = container.resolve('v');

	expect(a).toBe('value');
});

it('resolves dependencies', () => {
	const container = new Container();

	class B {}

	class A {
		constructor(public b: B) {}
	}

	inject(A, [B]);

	container.register(A);
	container.register(B);

	const a = container.resolve<A>(A);

	expect(a).toBeInstanceOf(A);
	expect(a.b).toBeInstanceOf(B);
});
