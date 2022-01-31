/* eslint-env node */
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import "core-js/stable";
import pkg from './package.json';


const dependencies = Object.keys(pkg.dependencies ?? []);


/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const config = [
    // Node build
    // No transpilation or bundling other than conversion from ES modules to CJS.
    {
        input: pkg.source,
        output: {
            file: pkg.main,
            format: 'cjs',
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
        output: {
            file: pkg.module,
            format: 'es',
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
                babelHelpers: 'bundled',
                presets: [
                    ['@babel/preset-env', {
                        modules: false,
                        targets: '> 0.25%, last 2 versions, not dead, not IE 11',
                        useBuiltIns: 'usage',
                        corejs: '3.80'
                    }]
                ],
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                preventAssignment: true,
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
            })
        ]
    },

    // Standalone UMD browser build (minified)
    // Transpiles to es version supported by preset-env's default browsers list and
    // bundles all dependencies and polyfills.
    {
        input: pkg.source,
        output: [
            {
                file: pkg.unpkg,
                format: 'umd',
                name: 'GhostSeriesDisplay',
                sourcemap: true,
                plugins: []
            },
            {
                file: pkg.umd,
                format: 'umd',
                name: 'GhostSeriesDisplay',
                sourcemap: true,
                plugins: [terser()]
            }
        ],
        plugins: [
            resolve({
                browser: true
            }),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            }),
            babel({
                babelHelpers: 'bundled',
                presets: [
                    ['@babel/preset-env', {
                        modules: 'auto',
                        targets: '> 0.25%, last 2 versions, not dead, not IE 11',
                        useBuiltIns: 'usage',
                        corejs: '3.80'
                    }]
                ],
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                preventAssignment: true,
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
            })
        ]
    }
];

export default config;