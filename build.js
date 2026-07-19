// Generates all 4 preset JSON files for Fusion import
// Source patterns use custom Epx-Badge SVG mappings
const fs=require('fs'),path=require('path');

const I_EPX='https://cdn.jsdelivr.net/gh/6otho/Epx-Badge@main/Badges/';

const ST={
  res:{bc:'#FF858283',bg:'#33FFFFFF',tc:'#FFFFFF'},
  tr:{bc:'#00000000',bg:'#00000000',tc:'#FFFFFF'},
  dim:{bc:'#00000000',bg:'#00000000',tc:'#80FFFFFF'},
};

function mk(id,name,pat,img,st,gid){
  return{borderColor:st.bc,groupId:gid,id,imageURL:img?I_EPX+img:'',isEnabled:true,name,pattern:pat,tagColor:st.bg,tagStyle:'filled',textColor:st.tc,type:'filter'};
}

const DV='\\b(?:dv|dovi|dolby[\\s._-]?vision)\\b';
const ATMOS='\\batmos\\b';
const TH='\\btrue[\\s._-]?hd\\b';
const DDP='(?:\\bddp|\\bdd\\+|\\beac-?3|\\be-?ac-?3)';
const DD='\\b(?:dd[25][. ][01]|dd[^p+a-z]\\b|\\bac-?3)\\b';

function gen(C){
  const T=[],G=[];

  // 1) Source
  T.push(mk('s-uhdbd','Ultra HD Blu-ray','(?i)\\b(uhd|ultra[\\s._-]?hd)[\\s._-]*(blu[\\s._-]?ray|bluray|bd)\\b','u-hd-blu-ray.svg',ST.res,'gs'));
  T.push(mk('s-bluray','Blu-ray Disc','(?i)\\b(blu[\\s._-]?ray|bluray|bdrip|bdremux)\\b(?!.*(uhd|ultra[\\s._-]?hd))','blu-raydisc.svg',ST.res,'gs'));
  T.push(mk('s-hdtv','HDTV','(?i)\\bhdtv\\b','hdtv.svg',ST.res,'gs'));
  T.push(mk('s-dvd','DVD RIP','(?i)\\b(dvd[\\s._-]?rip|dvdrip)\\b','dvd.svg',ST.res,'gs'));

  // 2) Resolution
  T.push(mk('r-4k','4K','(?i)^(?=.*(?:2160[pi]?|4k|uhd))(?!.*(?:1080[pi]?|720[pi]?))','4Kx-1.svg',ST.res,'gr'));
  T.push(mk('r-1080','1080p','(?i)\\b1080[pi]?\\b','1080p-a.svg',ST.res,'gr'));
  T.push(mk('r-720','720p','(?i)\\b720[pi]?\\b','720p-b.svg',ST.res,'gr'));

  // 3) DTS
  T.push(mk('a-dtsx','DTS:X','(?i)\\bdts[-_.: ]?x\\b','dts-x.svg',ST.res,'ga'));
  T.push(mk('a-dtsma','DTS-HD MA','(?i)^(?=.*\\bdts[-_. ]?(?:hd[-_. ]?)?ma\\b)(?!.*\\bdts[-_.: ]?x\\b)','dts-hd-ma.svg',ST.res,'ga'));
  T.push(mk('a-dtshd','DTS-HD','(?i)^(?=.*\\bdts[-_. ]?hd\\b)(?!.*\\bdts[-_. ]?(?:hd[-_. ]?)?ma\\b)(?!.*\\bdts[-_.: ]?x\\b)','dts-hd.svg',ST.res,'ga'));
  T.push(mk('a-dts','DTS','(?i)^(?=.*\\bDTS\\b)(?!.*\\bdts[-_. ]?(?:hd|ma|xll|x)\\b)','dts.svg',ST.res,'ga'));

  // 4) HDR Display
  const dvBlock=C.hdr==='nodv'?'(?!.*'+DV+')':'';
  T.push(mk('v-hdr10p','HDR10+','(?i)^'+dvBlock+'(?=.*hdr[\\s._-]?10[\\s._-]?(?:\\\\+|plus|p))','hdr10p-xx.svg',ST.res,'gv'));
  T.push(mk('v-hdr10','HDR10','(?i)^'+dvBlock+'(?=.*hdr[\\s._-]?10)(?!.*hdr[\\s._-]?10[\\s._-]?(?:\\\\+|plus|p))','hdr10-x.svg',ST.res,'gv'));
  T.push(mk('v-hdr','HDR','(?i)^'+dvBlock+'(?=.*\\bHDR\\b)(?!.*hdr[\\s._-]?10)','hdr-x.svg',ST.res,'gv'));

  T.push(mk('v-imax-e','IMAX Enhanced','(?i)\\bimax[\\s._-]?enhanced\\b','imax-e.svg',ST.res,'gv'));
  T.push(mk('v-imax','IMAX','(?i)^(?=.*\\bIMAX\\b)(?!.*enhanced)','imax.svg',ST.res,'gv'));

  // 5) Separate Audio & Video Tech (以完美的并排形式渲染)
  T.push(mk('a-dv','DV','(?i)'+DV,'dolby-vision-x.svg',ST.tr,'gv'));
  T.push(mk('a-at','Atmos','(?i)'+ATMOS,'dolby-atmos-x.svg',ST.tr,'ga'));
  T.push(mk('a-th','TrueHD','(?i)^(?=.*'+TH+')(?!.*'+ATMOS+')','true-hd-1.svg',ST.tr,'ga'));
  T.push(mk('a-dp','DD+','(?i)^(?=.*'+DDP+')(?!.*'+ATMOS+')(?!.*'+TH+')','dolby-digitalplus-x.svg',ST.tr,'ga'));
  T.push(mk('a-dd','DD','(?i)^(?=.*'+DD+')(?!.*'+DDP+')(?!.*'+TH+')(?!.*ATMOS)','dolby-digital-x.svg',ST.tr,'ga'));

  // 6) Channels
  T.push(mk('ch-71','7.1','[^0-9][7-8][. ][01](?![0-9])','7.1-6.svg',ST.tr,'gc'));
  T.push(mk('ch-51','5.1','^(?=.*[^0-9]5[. ][01](?![0-9]))(?!.*[^0-9][7-8][. ][01](?![0-9]))','5.1-6.svg',ST.tr,'gc'));

  // 7) Languages
  const L=[['en','\ud83c\uddec\ud83c\udde7','(?i)\\benglish\\b|\\beng\\b'],['es','\ud83c\uddea\ud83c\uddf8','(?i)\\bspanish\\b|\\bspa\\b'],['fr','\ud83c\uddeb\ud83c\uddf7','(?i)\\bfrench\\b|\\bfra\\b|\\bfr\\b|\\bvff\\b|\\bvfq\\b'],['de','\ud83c\udde9\ud83c\uddea','(?i)\\bgerman\\b|\\bdeu\\b'],['it','\ud83c\uddee\ud83c\uddf9','(?i)\\bitalian\\b|\\bita\\b'],['pt','\ud83c\udde7\ud83c\uddf7','(?i)\\bportuguese\\b|\\bpor\\b'],['ja','\ud83c\uddef\ud83c\uddf5','(?i)\\bjapanese\\b|\\bjpn\\b|[\u3040-\u309F\u30A0-\u30FF]{3,}'],['ko','\ud83c\uddf0\ud83c\uddf7','(?i)\\bkorean\\b|\\bkor\\b|[\uAC00-\uD7AF]{3,}'],['zh','\ud83c\udde8\ud83c\uddf3','(?i)\\bchinese\\b|\\bchi\\b|[\u4E00-\u9FFF]{3,}'],['hi','\ud83c\uddee\ud83c\uddf3','(?i)\\bhindi\\b|\\bhin\\b|[\u0900-\u097F]{3,}'],['ar','\ud83c\uddf8\ud83c\dde6','(?i)\\barabic\\b|\\bara\\b|[\u0600-\u06FF]{3,}'],['ru','\ud83c\uddf7\ud83c\uddfa','(?i)\\brussian\\b|\\brus\\b|[\u0400-\u04FF]{3,}'],['mu','\ud83c\udf10','(?i)\\bmulti\\b|\\bdual[\\s._-]?audio\\b']];
  for(const[c,f,pt] of L)T.push(mk('l-'+c,f,pt,'',ST.dim,'gl'));

  G.push({borderColor:'#00000000',color:'#27C04F',id:'gs',isExpanded:true,name:'Source'});
  G.push({borderColor:ST.res.bc,color:'#FFBE01',id:'gr',isExpanded:true,name:'Resolution'});
  G.push({borderColor:ST.res.bc,color:'#FF6B6B',id:'gv',isExpanded:true,name:'Visual'});
  G.push({borderColor:'#00000000',color:'#45B7D1',id:'ga',isExpanded:true,name:'Audio'});
  G.push({borderColor:'#00000000',color:'#FFD700',id:'gc',isExpanded:true,name:'Channels'});
  G.push({borderColor:'#00000000',color:'#4ECDC4',id:'gl',isExpanded:true,name:'Language'});

  return{filters:T,groups:G};
}

const dir=path.join(__dirname,'presets');
fs.mkdirSync(dir,{recursive:true});
let count=0;
for(const icon of['colored','mono']){
  for(const hdr of['nodv','always']){
    const data=gen({icon,hdr});
    const name=`${icon}-${hdr}.json`;
    fs.writeFileSync(path.join(dir,name),JSON.stringify(data,null,2));
    count++;
  }
}
console.log(`Generated ${count} presets.`);
