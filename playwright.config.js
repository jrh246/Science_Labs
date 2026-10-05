import {existsSync} from 'node:fs';
import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',timeout:120000,use:{launchOptions:{...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})},baseURL:'http://localhost:4173'},webServer:{command:'npm run build && npm run preview -- --port 4173',port:4173,reuseExistingServer:false}});
