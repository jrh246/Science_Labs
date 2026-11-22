import serverless from 'serverless-http';

// Better Auth exposes a Fetch API handler. Use it directly for API Gateway so
// cookie/redirect responses don't depend on a simulated Node response stream.
export function gatewayHandler(platform,config){
  // Gateway v2 decodes base64 automatically. Preserve arbitrary release bytes,
  // including PDF resources and images, instead of converting them to UTF-8.
  const application=serverless(platform.app,{binary:true,request(req,event){req.headers['x-science-client-ip']=event.requestContext?.http?.sourceIp||'unknown';}});
  return async(event,context)=>{
    const path=event.rawPath||event.requestContext?.http?.path||'';
    if(!path.startsWith('/api/auth/')||event.requestContext?.http?.method==='OPTIONS')return application(event,context);
    const headers=new Headers(event.headers||{});
    if(event.cookies?.length)headers.set('cookie',event.cookies.join('; '));
    headers.set('x-science-client-ip',event.requestContext?.http?.sourceIp||'unknown');
    const method=event.requestContext?.http?.method||'GET';
    const body=!['GET','HEAD'].includes(method)&&event.body?Buffer.from(event.body,event.isBase64Encoded?'base64':'utf8'):undefined;
    const request=new Request(config.apiUrl+path+(event.rawQueryString?'?'+event.rawQueryString:''),{method,headers,body});
    const response=await platform.auth.handler(request);
    const outputHeaders={};for(const [key,value] of response.headers)if(key!=='set-cookie')outputHeaders[key]=value;
    outputHeaders['cache-control']='no-store';
    if([config.appUrl,config.apiUrl].includes(headers.get('origin'))){outputHeaders['access-control-allow-origin']=headers.get('origin');outputHeaders['access-control-allow-credentials']='true';outputHeaders.vary='Origin';}
    return {statusCode:response.status,headers:outputHeaders,cookies:response.headers.getSetCookie(),body:Buffer.from(await response.arrayBuffer()).toString('base64'),isBase64Encoded:true};
  };
}
