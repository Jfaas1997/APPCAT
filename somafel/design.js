/* Design comum da Central de Obras e das apps (movimento técnico, vidro, cartões, tema).
   Carregado pela Central e por cada app; as apps aplicam-no sozinhas quando abertas fora da Central. */
/* ===== movimento «técnico» (escolhido a 2 nov 2026): o ecrã novo é revelado da esquerda para a direita por uma linha amarela ===== */
var MV_T=300;
var MV_CSS='@keyframes mvWipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}@keyframes mvScan{0%{transform:translateX(0);opacity:1}88%{opacity:1}100%{transform:translateX(var(--mvw));opacity:0}}'
  +'.mvWipe{animation:mvWipe '+MV_T+'ms cubic-bezier(.65,0,.35,1) both}'
  +'.mvScanL{position:fixed;width:2px;background:#F9D115;box-shadow:0 0 18px 4px rgba(249,209,21,.55);z-index:2147483000;pointer-events:none;animation:mvScan '+MV_T+'ms cubic-bezier(.65,0,.35,1) both}'
  +'@keyframes mvLogo{0%{opacity:0;transform:scale(.7) translateY(10px);filter:blur(8px)}60%{opacity:1;transform:scale(1.04);filter:blur(0)}100%{transform:none}}'
  +'@keyframes mvEsq{from{transform:translateX(-100%)}to{transform:none}}@keyframes mvCima{from{transform:translateY(-100%);opacity:0}to{transform:none;opacity:1}}'
  +'@media (prefers-reduced-motion:reduce){.mvWipe{animation:none!important}.mvScanL{display:none!important}}'
  +'/*central*/'+'.ov:not(.cen){justify-content:flex-end;align-items:stretch;padding:12px;background:rgba(10,12,16,.32);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}'
  +'.ov:not(.cen)>.jan{max-height:calc(100vh - 24px);height:calc(100vh - 24px);border-radius:20px;box-sizing:border-box;animation:mvGav .4s cubic-bezier(.2,.9,.25,1) both;box-shadow:-24px 0 60px rgba(0,0,0,.28)}'
  +'.ov:not(.cen)>.jan.larga{max-width:760px}'
  +'@keyframes mvGav{from{transform:translateX(calc(100% + 24px))}to{transform:none}}@keyframes mvGavS{to{transform:translateX(calc(100% + 24px))}}@keyframes mvFdS{to{opacity:0}}'
  +'.ov.sai{animation:mvFdS .23s ease-in both}.ov.sai:not(.cen)>.jan{animation:mvGavS .23s cubic-bezier(.4,0,1,1) both}.ov.sai.cen>.jan{animation:mvFdS .18s both}'
  +'@media (prefers-reduced-motion:reduce){.ov>.jan,.ov.sai,.ov.sai>.jan{animation:none!important}}'
  +'@keyframes mvTr{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}@keyframes mvFd{from{opacity:0}}@keyframes mvRo{from{stroke-dasharray:0 415}}@keyframes mvSy{from{transform:scaleY(0)}}@keyframes mvSx{from{transform:scaleX(0)}}'
  +'.pd path.mvL{stroke-dasharray:1;animation:mvTr 1.3s cubic-bezier(.4,0,.2,1) .35s both}.pd .spk path:first-child,.pd .gr path[fill-opacity],.pd .gr path[stroke-dasharray]{animation:mvFd .9s ease .9s both}'
  +'.pd circle.mvR{animation:mvRo 1.1s cubic-bezier(.2,.8,.2,1) both}.pd .pbar i{transform-origin:bottom;animation:mvSy .9s cubic-bezier(.2,.8,.2,1) both}.pd .sb i{display:block;transform-origin:left;animation:mvSx 1s cubic-bezier(.2,.8,.2,1) both}'
  +[1,2,3,4,5,6,7,8,9,10,11,12].map(n=>'.pd .pbar>div:nth-child('+n+') i{animation-delay:'+(0.3+n*0.06).toFixed(2)+'s}.pd .pc>div:nth-of-type('+n+') .sb i{animation-delay:'+(0.3+n*0.07).toFixed(2)+'s}').join('')
  +'@media (prefers-reduced-motion:reduce){.pd path.mvL,.pd circle.mvR,.pd .pbar i,.pd .sb i,.pd .spk path,.pd .gr path{animation:none!important}}';
/* números que sobem até ao valor (mantém o formato: 1,28 M€, 32,8%, 125 k€…) */
function mvConta(el,ms){try{if(!el||el.__mvc||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const t=el.textContent,m=t.match(/(\d(?:[\d   .]*\d)?)(,(\d+))?/);if(!m)return;
  const ip=m[1].replace(/[^\d]/g,''),dec=m[3]?m[3].length:0,alvo=parseFloat(ip+(dec?'.'+m[3]:''));if(!isFinite(alvo)||alvo===0)return;el.__mvc=1;
  const pre=t.slice(0,m.index),suf=t.slice(m.index+m[0].length),fmt=v=>v.toLocaleString('pt-PT',{minimumFractionDigits:dec,maximumFractionDigits:dec}),t0=performance.now();ms=ms||1000;
  const f=now=>{const k=Math.min(1,(now-t0)/ms),e=1-Math.pow(1-k,3);el.textContent=pre+fmt(alvo*e)+suf;if(k<1)requestAnimationFrame(f);else el.textContent=t};requestAnimationFrame(f)}catch(e){}}
/* transição suave (3 nov 2026): o ecrã novo aparece com um esbatimento curto e sobe 6 px; substitui o varrimento */
function mvVarre(el){try{if(!el||!el.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=el.getBoundingClientRect();if(r.width<40||r.height<40)return;
  if(el.__mvA)try{el.__mvA.cancel()}catch(e){}
  el.__mvA=el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:MV_T,easing:'cubic-bezier(.2,.7,.2,1)'})}catch(e){}}
/* ícones de vidro na barra lateral (Central e apps) */
var MV_VIDRO='';
/* cartões de vidro (Central e apps): fundo com brilho suave e cartões translúcidos */
var MV_ESC=':root[data-tema="escuro"] ';
var MV_CART=(()=>{const sel='.card,.box,.pcard,.rvc',c=x=>sel.split(',').map(y=>x+y).join(',');
  const claro='background:rgba(255,255,255,.68)!important;backdrop-filter:blur(16px) saturate(1.5);-webkit-backdrop-filter:blur(16px) saturate(1.5);border:1px solid rgba(255,255,255,.85)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 8px 26px rgba(20,24,32,.07),0 1px 2px rgba(20,24,32,.05)!important;border-radius:16px';
  const escuro='background:rgba(26,31,38,.72)!important;border:1px solid rgba(255,255,255,.07)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 10px 28px rgba(0,0,0,.35)!important';
  const fundo='background-image:radial-gradient(1100px 460px at 88% -10%,rgba(249,209,21,.16),rgba(249,209,21,0) 70%),radial-gradient(900px 420px at -8% 108%,rgba(120,170,255,.10),rgba(120,170,255,0) 70%)!important;background-attachment:fixed!important';
  return 'body{'+fundo+'}'+c('')+'{'+claro+'}'
    +'@media (prefers-color-scheme:dark){:root:not([data-tema="claro"]) '+sel.split(',').join(',:root:not([data-tema="claro"]) ')+'{'+escuro+'}}'
    +c(MV_ESC)+'{'+escuro+'}'
    +'.box>.bh{background:rgba(43,48,56,.04)!important;border-radius:16px 16px 0 0}'
    +'@media (prefers-color-scheme:dark){:root:not([data-tema="claro"]) .box>.bh{background:rgba(255,255,255,.03)!important}}'+MV_ESC+'.box>.bh{background:rgba(255,255,255,.03)!important}'})();
/* nas apps (iframes): ao carregar num separador da barra lateral, a zona de trabalho é revelada da mesma maneira */
function mvNaApp(d){try{if(d.getElementById('mv-tec'))return;const st=d.createElement('style');st.id='mv-tec';st.textContent=MV_CSS.split('/*central*/')[0]+MV_VIDRO+MV_CART+'.view.vin{animation:none!important}main{background:transparent!important}';d.head.appendChild(st);
  d.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('#side .tab,#side .gtab,#subtabs button,nav.lado .ni,#side [data-v],.bnav button,.tabbar button');if(!t||t.id==='cVoltar')return;
    setTimeout(()=>mvVarre(d.querySelector('main')||d.querySelector('.corpo')||d.body),0)},true)}catch(e){}}

/* tema partilhado: a escolha feita na Central (claro/escuro) vale em todas as apps, também abertas sozinhas, e muda logo nas que estão abertas */
function mvTema(d){try{d=d||document;var r=d.documentElement,t=null;try{t=localStorage.getItem('tema')}catch(e){}
  if(t==='claro'||t==='escuro'){r.setAttribute('data-tema',t);r.setAttribute('data-theme',t==='escuro'?'dark':'light')}
  else if(r.getAttribute('data-tema')){}}catch(e){}}
(function(){try{
  if(!window.__mvCentral){mvTema();
    addEventListener('storage',function(e){if(e.key==='tema')mvTema()});
    var ok=function(){mvNaApp(document)};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ok);else ok()}
}catch(e){}})();

/* ===== gráficos dos resumos (Medições CAT e RCT): anel, barras empilhadas, colunas por mês, comparação; dica ao passar o rato ===== */
(function(){try{
  var css='.mvg{--g1:#2a78d6;--g2:#9fbde6;--g3:#d6dbe2;--gw:#c4730a;--gt:var(--muted,#5a5e66)}'
   +'@media (prefers-color-scheme:dark){:root:not([data-tema="claro"]) .mvg{--g1:#4b94ee;--g2:#33507a;--g3:#2a3039;--gw:#e0953a}}'
   +':root[data-tema="escuro"] .mvg{--g1:#4b94ee;--g2:#33507a;--g3:#2a3039;--gw:#e0953a}'
   +'.mvg{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:12px;margin:12px 0}'
   +'.mvg .mgc{background:var(--sheet,#fff);border:1px solid var(--rule,#d8d8d4);border-radius:10px;padding:14px 16px;min-width:0}.mvg .mgc.mgw2{grid-column:1/-1}'
   +'.mvg h4{margin:0 0 2px;font-size:13px;font-weight:600}.mvg .mgs{font-size:12px;color:var(--gt);margin-bottom:10px}'
   +'.mvg .mgh{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.mvg .mgh .mgn{display:flex;flex-direction:column;gap:2px;min-width:120px}.mvg .mgh .mgn b{font-size:22px;font-weight:600;line-height:1.15}.mvg .mgh .mgn span{font-size:12px;color:var(--gt)}'
   +'.mvg .mgring{flex:0 0 auto}.mvg .mgring .bg{stroke:var(--g3)}.mvg .mgring .fg{stroke:var(--g1)}.mvg .mgring text{fill:var(--ink,#2b3038);font-family:inherit}'
   +'.mvg .mgr{display:grid;grid-template-columns:minmax(80px,32%) minmax(0,1fr) auto;gap:10px;align-items:center;padding:3px 0;font-size:12.5px}.mvg .mgr .mgl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mvg .mgr .mgv{font-size:12px;color:var(--gt);white-space:nowrap;text-align:right}'
   +'.mvg .mgtk{display:flex;height:10px;background:transparent;border-radius:5px;overflow:hidden;gap:2px}.mvg .mgtk i{display:block;height:100%;border-radius:4px}.mvg .mgtk .a{background:var(--g1)}.mvg .mgtk .b{background:var(--g3)}.mvg .mgtk .c{background:var(--g2)}.mvg .mgtk .w{background:var(--gw)}'
   +'.mvg .mgk{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--gt);margin-top:8px}.mvg .mgk span{display:inline-flex;gap:6px;align-items:center}.mvg .mgk i{width:10px;height:10px;border-radius:3px;display:inline-block}'
   +'.mvg svg.cols text{font-size:10.5px;fill:var(--gt);font-family:inherit}.mvg svg.cols .bar{fill:var(--g1)}.mvg svg.cols .bar.cum{fill:var(--g2)}.mvg svg.cols .hit{fill:transparent}.mvg svg.cols .hit:hover{fill:rgba(128,128,128,.12)}.mvg svg.cols .base{stroke:var(--rule,#d8d8d4)}'
   +'.mvg [data-tip]{cursor:default}.mvg details{margin-top:8px;font-size:12px}.mvg details summary{cursor:pointer;color:var(--gt)}'
   +'#gTip{position:fixed;z-index:2147483200;pointer-events:none;background:var(--ink,#2b3038);color:var(--sheet,#fff);padding:6px 9px;border-radius:7px;font-size:12px;line-height:1.35;max-width:260px;opacity:0;transition:opacity .12s}'
   +'@media (prefers-reduced-motion:reduce){#gTip{transition:none}}';
  var e=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var f=function(n,d){return Number(n).toLocaleString('pt-PT',{minimumFractionDigits:0,maximumFractionDigits:d==null?1:d})};
  var G={e:e,f:f,css:css};
  G.donut=function(p,sub){p=Math.max(0,Math.min(1,p||0));var r=50,c=2*Math.PI*r;
    return '<svg class="mgring" width="124" height="124" viewBox="0 0 124 124" role="img" aria-label="'+e(Math.round(p*100)+'% '+(sub||''))+'"><circle class="bg" cx="62" cy="62" r="'+r+'" fill="none" stroke-width="12"/>'
     +(p>0?'<circle class="fg" cx="62" cy="62" r="'+r+'" fill="none" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+(c*p).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 62 62)"/>':'')
     +'<text x="62" y="68" text-anchor="middle" font-size="26" font-weight="600">'+Math.round(p*100)+'%</text></svg>'};
  /* linhas: {l,a,t,tip?} a = feito, t = total (a barra tem o comprimento proporcional ao maior total) */
  G.stack=function(rows,un){var mx=0;rows.forEach(function(r){if(r.t>mx)mx=r.t});un=un||'';
    return rows.map(function(r){var w=mx?r.t/mx*100:0,pa=r.t?Math.min(1,r.a/r.t):0,tip=r.tip||(r.l+': '+f(r.a)+' de '+f(r.t)+un+' ('+Math.round(pa*100)+'%)');
      return '<div class="mgr" data-tip="'+e(tip)+'"><span class="mgl" title="'+e(r.l)+'">'+e(r.l)+'</span><div class="mgtk" style="width:'+Math.max(w,2).toFixed(1)+'%"><i class="a" style="flex:'+(pa*100).toFixed(2)+'"></i><i class="b" style="flex:'+((1-pa)*100).toFixed(2)+'"></i></div><span class="mgv">'+f(r.a)+' / '+f(r.t)+un+' · '+Math.round(pa*100)+'%</span></div>'}).join('')};
  /* comparação: {l, prev, real, exc} */
  G.cmp=function(rows,un){var mx=0;rows.forEach(function(r){mx=Math.max(mx,r.prev,r.real)});un=un||' m';
    return rows.map(function(r){var wp=mx?r.prev/mx*100:0,wr=mx?r.real/mx*100:0,tip=r.l+': previsto '+f(r.prev)+un+', feito '+f(r.real)+un+(r.exc>0?', a mais '+f(r.exc)+un:'');
      return '<div class="mgr" data-tip="'+e(tip)+'" style="align-items:start"><span class="mgl" title="'+e(r.l)+'">'+e(r.l)+'</span><div style="display:flex;flex-direction:column;gap:3px"><div class="mgtk" style="width:'+Math.max(wp,1).toFixed(1)+'%"><i class="c" style="flex:1"></i></div><div class="mgtk" style="width:'+Math.max(wr,r.real>0?1:0).toFixed(1)+'%"><i class="'+(r.exc>0?'w':'a')+'" style="flex:1"></i></div></div><span class="mgv">'+f(r.real)+' / '+f(r.prev)+un+(r.exc>0?' · ▲ +'+f(r.exc)+un:'')+'</span></div>'}).join('')};
  /* colunas: items {l,v,cum?} */
  G.cols=function(items,un){if(!items.length)return '';un=un||'';var W=Math.max(320,items.length*46),H=150,pb=22,pt=14,mx=0;items.forEach(function(i){if(i.v>mx)mx=i.v});mx=mx||1;
    var bw=Math.min(28,(W-20)/items.length*.6),st=(W-20)/items.length,out='<svg class="cols" viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Colunas por período"><line class="base" x1="10" x2="'+(W-10)+'" y1="'+(H-pb)+'" y2="'+(H-pb)+'"/>';
    items.forEach(function(i,k){var h=(H-pb-pt)*i.v/mx,x=10+st*k+(st-bw)/2,y=H-pb-h;
      out+='<g data-tip="'+e(i.l+': '+f(i.v)+un+(i.cum!=null?' · acumulado '+f(i.cum)+un:''))+'"><rect class="hit" x="'+(10+st*k)+'" y="0" width="'+st+'" height="'+(H-pb)+'"/><path class="bar" d="M'+x.toFixed(1)+' '+(H-pb)+'V'+(y+3).toFixed(1)+'Q'+x.toFixed(1)+' '+y.toFixed(1)+' '+(x+3).toFixed(1)+' '+y.toFixed(1)+'H'+(x+bw-3).toFixed(1)+'Q'+(x+bw).toFixed(1)+' '+y.toFixed(1)+' '+(x+bw).toFixed(1)+' '+(y+3).toFixed(1)+'V'+(H-pb)+'Z"/>'
        +(i.v===mx?'<text x="'+(x+bw/2).toFixed(1)+'" y="'+Math.max(10,y-4).toFixed(1)+'" text-anchor="middle">'+f(i.v)+'</text>':'')
        +(items.length<=14||k%Math.ceil(items.length/12)===0?'<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle">'+e(i.l)+'</text>':'')+'</g>'});
    return out+'</svg>'};
  G.leg=function(a){return '<div class="mgk">'+a.map(function(x){return '<span><i style="background:var(--'+x[0]+')"></i>'+e(x[1])+'</span>'}).join('')+'</div>'};
  window.MVG=G;
  var st=document.createElement('style');st.id='mv-graf';st.textContent=css;(document.head||document.documentElement).appendChild(st);
  var tp=null,mv=function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('[data-tip]');
    if(!t||!t.closest('.mvg')){if(tp)tp.style.opacity=0;return}
    if(!tp){tp=document.createElement('div');tp.id='gTip';tp.setAttribute('role','tooltip');document.body.appendChild(tp)}
    tp.textContent=t.getAttribute('data-tip');tp.style.opacity=1;var w=tp.offsetWidth,x=Math.min(innerWidth-w-8,ev.clientX+12),y=ev.clientY+16;if(y+tp.offsetHeight>innerHeight)y=ev.clientY-tp.offsetHeight-12;tp.style.left=Math.max(4,x)+'px';tp.style.top=y+'px'};
  document.addEventListener('mousemove',mv);document.addEventListener('mouseleave',function(){if(tp)tp.style.opacity=0},true);
}catch(x){}})();
