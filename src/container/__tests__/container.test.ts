import { inject } from '../../injection';
import { Container } from '../container';
import { Lifespan } from '../types';

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

it('resolves dependencies via config', () => {
	const container = new Container();

	class B {}

	class A {
		constructor(public b: B) {}
	}

	inject(A, [B]);

	container.register(A, { class: A });
	container.register(B, { class: B });

	const a = container.resolve<A>(A);

	expect(a).toBeInstanceOf(A);
	expect(a.b).toBeInstanceOf(B);
});

it('resolves multiple dependency types', () => {
	const container = new Container();

	const getB = () => 'B';

	class A {
		constructor(
			public b: string,
			public c: string,
		) {}
	}

	inject(A, ['GetB', 'GetC']);

	container.register(A);
	container.register('GetB', { factory: getB });
	container.register('GetC', { value: 'C' });

	const a = container.resolve<A>(A);

	expect(a).toBeInstanceOf(A);
	expect(a.b).toBe('B');
	expect(a.c).toBe('C');
});

it('defaults to transient resolution', () => {
	const container = new Container();

	class A {}

	container.register(A);

	const a = container.resolve(A);
	const b = container.resolve(A);

	expect(a).not.toBe(b);
});

it('resolves singletons top level', () => {
	const container = new Container();

	class A {}

	container.register(A, { class: A, lifespan: Lifespan.Singleton });

	const a = container.resolve(A);
	const b = container.resolve(A);

	expect(a).toBe(b);
});

it('resolves nested singletons', () => {
	const container = new Container();

	class A {
		constructor(public b: B) {}
	}
	class B {}

	inject(A, [B]);

	container.register(A);
	container.register(B, { class: B, lifespan: Lifespan.Singleton });

	const a = container.resolve<A>(A);
	const b = container.resolve<A>(A);

	expect(a).not.toBe(b);
	expect(a.b).toBeInstanceOf(B);
	expect(a.b).toBe(b.b);
});

it('resolves resolution lifespan', () => {
	const container = new Container();

	class A {
		constructor(
			public b: B,
			public c: C,
		) {}
	}
	class B {
		constructor(public d: D) {}
	}
	class C {
		constructor(public d: D) {}
	}
	class D {}

	inject(A, [B, C]);
	inject(B, [D]);
	inject(C, [D]);

	container.register(A);
	container.register(B);
	container.register(C);
	container.register(D, { class: D, lifespan: Lifespan.Resolution });

	const a = container.resolve<A>(A);
	const b = container.resolve<A>(A);

	expect(a.b.d).toBeInstanceOf(D);
	expect(a.b.d).toBe(a.c.d);
	expect(a.b.d).not.toBe(b.b.d);
});

it('overrides replaces singleton instances', () => {
	const container = new Container();

	class A {}
	class B {}

	container.register(A, { class: A, lifespan: Lifespan.Singleton });

	const a = container.resolve(A);

	container.register(A, { class: B, lifespan: Lifespan.Singleton });

	const b = container.resolve(A);

	expect(a).toBeInstanceOf(A);
	expect(b).toBeInstanceOf(B);
});
