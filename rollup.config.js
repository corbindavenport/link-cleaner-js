import terser from '@rollup/plugin-terser';

export default {
    input: "src/main.js",
    output: [
        {
            file: "build/linkcleaner.js",
            format: "iife",
            sourcemap: true,
            name: "linkCleaner"
        },
        {
			file: 'build/linkcleaner.min.js',
			format: 'iife',
            name: "linkCleaner",
			sourcemap: true,
			plugins: [terser()]
		}
    ]

};
