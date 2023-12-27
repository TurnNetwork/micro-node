import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import * as path from "path";
import electron from "vite-plugin-electron";
import electronRenderer from "vite-plugin-electron-renderer";
import polyfillExports from "vite-plugin-electron-renderer"
import requireTransform from 'vite-plugin-require-transform';
import commonjs from '@rollup/plugin-commonjs';//
import { createHtmlPlugin } from 'vite-plugin-html';
//@ts-ignore
import { version } from './config/index.js';
export default defineConfig({
  plugins: [
    createHtmlPlugin({
      template: './index.html',
      inject: {
        data: {
          version: version.version,
          title: version.title,
          networkName: version.networkName
        },
      },
    }),
    commonjs() as any,
    vue(),
    requireTransform({
      fileRegex: /.js$|.ts$|.vue$/
    }),
    electron([{
      entry: "electron-main/main.ts",
    },
    {
      entry: path.join(__dirname, 'electron-preload/preload.ts')
    }
    ]),
    electronRenderer(),
    polyfillExports()
  ],
  define: {},
  base: './',
  resolve: {
    alias: {
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6', // add buffer
      ethers: '/node_modules/ethers/dist/ethers.min.js', // ethers
      Web3Dist: '/node_modules/web3/dist/web3.min.js', // ethers
      'root': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    emptyOutDir: false
  },
  server: {}
})
