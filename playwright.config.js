import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',timeout:120000,use:{launchOptions:{executablePath:'/usr/bin/chromium'},baseURL:'http://localhost:4173'},webServer:{command:'npm run build && npm run preview -- --port 4173',port:4173,reuseExistingServer:false}});
