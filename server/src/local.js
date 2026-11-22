import {configuration} from './config.js';
import {openDatabase,migrate} from './database.js';
import {createApp} from './app.js';
const config=configuration(process.env),db=await openDatabase(config);
await migrate(db);
const {app}=createApp(db,config);
app.listen(config.port,'127.0.0.1',()=>console.log(`Science Labs API ready at http://localhost:${config.port} (${config.environment}).`));
