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
        // ES Module (For modern bundlers like Vite, Webpack, Rollup)
        {
            file: "dist/linkcleaner.mjs",
            format: "es",
            sourcemap: true
        },
        // CommonJS (For Node.js and older bundlers)
        {
            file: "dist/linkcleaner.cjs",
            format: "cjs",
            sourcemap: true,
            exports: "auto"
        },
        // IIFE (For direct <script> tag usage in browsers)
        {
            file: "dist/linkcleaner.js",
            format: "iife",
            sourcemap: true,
            name: "linkCleaner"
        },
        // Minified IIFE
        {
            file: 'dist/linkcleaner.min.js',
            format: 'iife',
            name: "linkCleaner",
            sourcemap: true,
            plugins: [terser()]
        }
    ]
};