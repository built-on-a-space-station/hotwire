import { DependencyGraph } from '../dependency-graph';

it('creates a manifest of linear dependencies', () => {
	const graph = new DependencyGraph();

	graph.add('A', ['B', 'C']);
	graph.add('B', ['D']);

	const manifest = graph.createManifestFor('A');

	expect(manifest).toEqual([['D'], ['B', 'C'], ['A']]);
});

it('creates a manifest of crossed dependencies', () => {
	const graph = new DependencyGraph();

	graph.add('A', ['B', 'C']);
	graph.add('B', ['C', 'D']);

	const manifest = graph.createManifestFor('A');

	expect(manifest).toEqual([['C', 'D'], ['B'], ['A']]);
});
