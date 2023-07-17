import ts from 'rollup-plugin-typescript2'
import typescript from 'typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import external from 'rollup-plugin-peer-deps-external'
import svg from 'rollup-plugin-svg'
import url from '@rollup/plugin-url'
import json from 'rollup-plugin-json'
// importfont  from "rollup-plugin-font";

// import pkg from './package.json'

export default {
  input: './src/DualListPanel.tsx',
  output: [
    {
      file: './dist/bundle.cjs', //pkg.main,
      format: 'cjs',
      preferConst: true,
      interop: false,
      //exports: 'named',
      sourcemap: true,
    },
    {
      file: './dist/bundle.js', //pkg.module,
      format: 'es',
      preferConst: true,
      //exports: 'named',
      sourcemap: true,
    },
  ],
  plugins: [
    external(),
    url({ exclude: ['**/*.svg'] }),
    url({
      include: ['**/*.ttf', '**/*.eot', '**/*.woff', '**/*.woff2'],
      limit: Infinity,
    }),
    resolve(),
    ts({ typescript }),
    svg(),
    commonjs({ extensions: ['.js', '.ts'] }),
    json({
      // 默认情况下将解析所有JSON文件,
      // 但您可以专门包含/排除文件
      // exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],
      // exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],

      // 对于 tree-shaking, 属性将声明为
      // 变量, 使用 `var` 或者 `const`
      preferConst: true, // 默认是 false

      // 为生成的默认导出指定缩进 —
      // 默认为 '\t'
      indent: '  ',

      // 忽略缩进并生成最小的代码
      compact: true, // 默认是 false

      // 为JSON对象的每个属性生成一个命名导出
      namedExports: true, // 默认是 true
    }),
    //font()
  ],
}
