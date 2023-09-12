export type Constructor = { new (...args: any[]): any };

export type Token = string | symbol | Constructor;
