import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/miniprogram-http-request.js'
        },
        plugins: [
            resolve(),
            json(),
            commonjs(),
            babel({
                presets: [
                    ["@babel/preset-env"]
                ],
                exclude: 'node_modules/**'
            }),
        ]
    },
    {
        input: 'src/index.js',
        output: {
            file: 'dist/miniprogram-http-request.min.js'
        },
        plugins: [
            resolve(),
            json(),
            commonjs(),
            babel({
                presets: [
                    ["@babel/preset-env"]
                ],
                exclude: 'node_modules/**'
            }),
            terser()
        ]
    }
]