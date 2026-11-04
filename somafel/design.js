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
