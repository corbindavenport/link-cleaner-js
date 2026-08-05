import terser from '@rollup/plugin-terser';

export default {
    input: "src/main.js",
    output: [
        {
            file: "dist/linkcleaner.js",
            format: "iife",
            sourcemap: true,
            name: "linkCleaner"
        },
        {
			file: 'dist/linkcleaner.min.js',
			format: 'iife',
            name: "linkCleaner",
			sourcemap: true,
			plugins: [terser()]
		}
    ]

};
