// Artwork and placement targets share the same next-nucleotide work site.
// The existing strand tip trails this site after polymerase advances.
export function polymeraseGeometry(kind,added=0){
 if(kind==='rna')return {x:150+added*39,y:120,targetY:154,step:39,direction:1};
 const second=added>=3,count=second?added-3:added;
 return {
  second,count,x:second?597-count*47:80+count*47,
  y:second?222:102,targetY:second?208:116,step:47,direction:second?-1:1,
  tipX:second?(count?644-count*47:613):(count?33+count*47:64)
 };
}
