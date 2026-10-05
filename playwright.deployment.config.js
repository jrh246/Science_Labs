import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/deployment',timeout:60000,workers:1,
 use:{baseURL:'http://127.0.0.1:4174',launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{}},
 webServer:{command:'node scripts/serve-sites.mjs',url:'http://127.0.0.1:4174/Science_Labs/',reuseExistingServer:false},
});
