import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';

export default {
    input: "src/main.js",
    plugins: [
        babel({
            babelHelpers: "bundled",
            presets: [
                [
                    "@babel/preset-env",
                    {
                        targets: "> 0.15%, not dead, maintained node versions"
                    }
                ]
            ]
        })
    ],
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
