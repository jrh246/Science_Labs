import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve(process.env.SITE_ROOT||'../site');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith('/Science_Labs/')){res.writeHead(404).end();return;}
  let relative=decodeURIComponent(url.pathname.slice('/Science_Labs/'.length));
  if(!relative||relative.endsWith('/'))relative+='index.html';
  const file=resolve(root,relative);
  if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  const content=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'}).end(content);
 }catch{res.writeHead(404).end();}
}).listen(4174,'127.0.0.1');
