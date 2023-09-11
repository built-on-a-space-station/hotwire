# Hotwire IOC

Hotwire is a simple Dependency Injection container. It allows you to use DI in environments that don't support TypeScript decorator metadata (ex. Vite), which are standard on many other solutions.

## Basic Usage

```ts
import { container, inject } from '@space-station/hotwire';

class Idol {}
class Whip {}

class HiddenTemple {
	constructor(
		public idol: Idol,
		public whip: Whip,
	) {}
}

inject(HiddenTemple, [Idol, Whip]);

container.register(Idol);
container.register(Whip);
container.register(HiddenTemple);

const temple = container.resolve(HiddenTemple);

console.log(temple.idol); // Idol{}
console.log(temple.whip); // Whip{}
```

## The Gist

Hotwire works by registering any injectable resource (a class, instance, static value, etc.) with the `container` via a token (a constructor, symbol, string, etc.). When the container `resolve`s a token, it will automatically pass required dependencies to class instances and apply any additional configuration of lifecycle handling to those values. This allows for any number of class instances to be connected to each other automatically.

## Class Definition

Use the `inject` helper to mark a class constructor as being injected with dependencies. The first argument is the class to be marked as injectable. The second is an array of **tokens** representing injectable values registered with the container. At runtime the DI container will determine which dependencies must be resolved and passed into the class constructor.

The array of tokens passed to `inject` should resolve to match the parameter types of the constructor.

## Registration

Any injectable value must be registered with the container prior to the first resolution. If registering a class constructor you can pass it as the only argument to `register()`. This will link a token of the constructor to the constructor itself. Alternatively, you can specify the token to use. When doing so, the token must be utilized when calling `inject()` or `resolve()`.

```ts
container.register('SecretTemple', HiddenTemple);

container.resolve('SecretTemple'); // HiddenTemple{}
```

Tokens can be constructor functions, strings, or symbols and should be unique. If you register another provider with an existing token it will override the previous entry.

By default `register()` will look for the second argument to be a class constructor. You can specify other types, or be explicit about using a class, by passing an options object.

```ts
// An instance of the class will be created during resolution
container.register('DoomTemple', { class: HiddenTemple });

// Any static value (object, string, number, instance, etc.) will be resolved
container.register('SecretTemple', { value: new HiddenTemple() });

// The factory function will be called at resolution
container.register('RandomTemple', { factory: () => createTemple() });
```

## Lifespan

For class and factory providers you can additionally specify a lifespan. This determines the scope in which a single instance or return value is used through the container and resolution process.

```ts
container.register('DoomTemple', {
	class: HiddenTemple,
	lifespan: Lifespan.Transient,
});
```

| Lifespan              | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `Lifespan.Transient`  | A new instance or value is generted for each resolution                    |
| `Lifespan.Resolution` | A single instance will be created for the scope an entire resolution chain |
| `Lifespan.Singleton`  | A single instance will be created for all resolutions                      |
