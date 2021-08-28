module.exports = function (config) {
	config.set({
		basePath: './',
		files: ['./src/**/*.ts', 'tests/**/*.spec.ts'],
		preprocessors: {
			'**/*.ts': 'karma-typescript'
		},
		frameworks: ['jasmine', 'karma-typescript'],
		karmaTypescriptConfig: {
			compilerOptions: {
				module: 'commonjs'
			},
			tsconfig: './tsconfig.spec.json'
		},
		browsers: ['Chrome'],
		reporters: ['progress', 'coverage', 'karma-typescript']
	});
};
