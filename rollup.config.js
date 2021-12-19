/* eslint-env node */
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import "core-js/stable";
import pkg from './package.json';


const dependencies = Object.keys(pkg.dependencies);


export default [
    // Node build
    // No transpilation or bundling other than conversion from ES modules to CJS.
    {
        input: pkg.source,
        output: {
            file: pkg.main,
            format: 'cjs',
            interop: false
        },
        plugins: [
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            })
        ],
        external: dependencies
    },

    // ES module build
    // Transpiles to ES version supported by preset-env's default browsers list and
    // bundles all necessary dependencies and polyfills.
    {
        input: pkg.source,
        output: [{
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }],
        plugins: [
            resolve({
                browser: true
            }),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            }),
            babel({
                presets: [
                    ['@babel/preset-env', {
                        modules: false,
                        targets: 'defaults',
                        useBuiltIns: 'usage',
                        corejs: 3
                    }]
                ],
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
            })
        ]
    },

    // Standalone UMD browser build (minified)
    // Transpiles to es version supported by preset-env's default browsers list and
    // bundles all dependencies and polyfills.
    {
        input: pkg.source,
        output: {
            file: pkg['umd:main'],
            format: 'umd',
            name: 'ghost-series-display',
            sourcemap: true
        },
        plugins: [
            resolve({
                browser: true
            }),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            }),
            babel({
                presets: [
                    ['@babel/preset-env', {
                        modules: false,
                        targets: 'defaults',
                        useBuiltIns: 'usage',
                        corejs: 3
                    }]
                ],
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
            }),
            terser()
        ]
    }
];