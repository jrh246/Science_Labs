import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig(({command})=>({
  // Local source pages need their handouts. Hosted portal builds must keep
  // runtime resources private and deliver them through the authorized API.
  publicDir:command==='serve'?resolve('public'):false,
  // A missing PDF must return 404, never an HTML fallback saved as a PDF.
  appType:'mpa',
  server:{host:'127.0.0.1',port:4310,strictPort:true,proxy:{'/api':'http://localhost:3301'}},
  build:{outDir:'dist-platform',rollupOptions:{input:{platform:resolve('platform.html')}}},
}));
