import {existsSync} from 'node:fs';
import {defineConfig} from '@playwright/test';
const testPort=Number(process.env.SCIENCE_LABS_TEST_PORT||4173);
if(!Number.isInteger(testPort)||testPort<1024||testPort>65535)throw Error('Invalid SCIENCE_LABS_TEST_PORT');
export default defineConfig({testDir:'./tests/browser',timeout:120000,use:{launchOptions:{...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})},baseURL:`http://localhost:${testPort}`},webServer:{command:`npm run build && npm run preview -- --port ${testPort}`,port:testPort,reuseExistingServer:false}});
