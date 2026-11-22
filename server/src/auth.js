import {betterAuth} from 'better-auth';
export function makeAuth(db,config,mail){
  return betterAuth({
    appName:'Science Labs',database:db,secret:config.secret,baseURL:config.apiUrl,basePath:'/api/auth',
    socialProviders:config.googleClientId?{google:{clientId:config.googleClientId,clientSecret:config.googleClientSecret}}:{},
    trustedOrigins:[config.appUrl,config.apiUrl],
    emailAndPassword:{enabled:true,requireEmailVerification:true,minPasswordLength:12,revokeSessionsOnPasswordReset:true,
      sendResetPassword:async({user,url})=>mail.auth(user.email,url,'reset')},
    emailVerification:{sendOnSignUp:true,autoSignInAfterVerification:false,expiresIn:3600,
      sendVerificationEmail:async({user,url})=>mail.auth(user.email,url,'verify')},
    session:{expiresIn:60*60*24*7,updateAge:60*60*24,cookieCache:{enabled:false}},
    rateLimit:{enabled:true,storage:'database',window:60,max:120,customRules:{'/sign-up/email':{window:60,max:60},'/sign-in/email':{window:60,max:100}}},
    advanced:{ipAddress:{ipAddressHeaders:['x-science-client-ip']},useSecureCookies:!config.local,cookiePrefix:`science-labs-${config.environment}`},
  });
}
