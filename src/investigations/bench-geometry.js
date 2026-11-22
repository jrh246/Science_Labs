import {valueAt,cellLength} from './extended-model.js';

export const benchView={width:600,height:330};

// Coordinates use the same viewBox as the apparatus artwork.
export const benchSites={
 microscope:[{x:157,y:188},{x:144,y:232},{x:157,y:188}],
 enzyme:[{x:139,y:92},{x:304,y:104},{x:169,y:88}],
 plant:[{x:300,y:250},{x:405,y:250},{x:300,y:138}],
 flies:[{x:120,y:66},{x:300,y:170},{x:300,y:170}],
 extraction:[{x:210,y:180},{x:210,y:180},{x:290,y:70},{x:330,y:105}],
 expression:[{x:290,y:55},{x:290,y:55},{x:290,y:272}],
 regulation:[{x:300,y:46},{x:300,y:160},{x:300,y:160},{x:300,y:160}],
 gel:[{x:300,y:180},{x:160,y:80.5},{x:495,y:265}]
};

export const gelLanes=[160,253,347,440].map(x=>({x,y:80.5}));
export const toolAnchors={pipette:{x:13,y:60},tube:{x:52,y:52},wire:{x:45,y:10}};

export function microscopeGeometry(run){
 const width=cellLength(run)*(run.objective===40?2:.5);
 const left=385-width/2;
 const visibleRight=385+Math.sqrt(160**2-(217-165)**2);
 return {width,left,visibleRight,pixelsPerDivision:4,unitsPerDivision:run.objective===40?2:8,
  rulerMaximum:Math.floor((visibleRight-left)/4*2)/2};
}

export function siteStyle(site){
 return `left:${site.x/benchView.width*100}%;top:${site.y/benchView.height*100}%`;
}

export function activeBenchSite(config,run){
 if(config.kind==='plant'&&run.prepared===2){
  const initialHeight=valueAt(config,run,0);
  return {x:300,y:250-initialHeight*18};
 }
 return benchSites[config.kind]?.[run.prepared];
}
