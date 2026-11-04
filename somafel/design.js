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

/* ===== gráficos dos resumos (Medições CAT e RCT) =====
   MVG.donut / stack / cmp / leg devolvem HTML; MVG.cols e MVG.curva devolvem um lugar que MVG.monta(raiz) desenha
   à largura real e volta a desenhar quando a janela muda de tamanho. Dica ao passar o rato em qualquer [data-tip] dentro de .mvg. */
(function(){try{
  var css='.mvg{--g1:#2a78d6;--g2:#9fbde6;--g3:#dfe3e8;--gw:#c4730a;--gt:var(--muted,#5a5e66);--gi:var(--ink,#2b3038);--gs:var(--sheet,#fff);--gb:var(--rule,#d8d8d4)}'
   +'@media (prefers-color-scheme:dark){:root:not([data-tema="claro"]) .mvg{--g1:#4b94ee;--g2:#2f5687;--g3:#2b313a;--gw:#e0953a}}'
   +':root[data-tema="escuro"] .mvg{--g1:#4b94ee;--g2:#2f5687;--g3:#2b313a;--gw:#e0953a}'
   +'.mvg .mgc{background:var(--gs);border:1px solid var(--gb);border-radius:12px;padding:16px 18px;min-width:0}'
   +'.mvg .mgc h4{margin:0;font-size:13.5px;font-weight:600;color:var(--gi)}.mvg .mgs{font-size:12px;color:var(--gt);margin:2px 0 12px}'
   +'.mvg .mgr{display:grid;grid-template-columns:minmax(70px,28%) minmax(0,1fr) auto;gap:10px;align-items:center;padding:4px 0;font-size:12.5px;border-radius:6px}.mvg .mgr:hover{background:color-mix(in srgb,var(--gi) 5%,transparent)}'
   +'.mvg .mgl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--gi)}.mvg .mgv{font-size:12px;color:var(--gt);white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums}'
   +'.mvg .mgtk{display:flex;height:10px;gap:2px}.mvg .mgtk i{display:block;height:100%;border-radius:4px;min-width:0}.mvg .mgtk .a{background:var(--g1)}.mvg .mgtk .b{background:var(--g3)}.mvg .mgtk .c{background:var(--g2)}.mvg .mgtk .w{background:var(--gw)}'
   +'.mvg .mgk{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--gt);margin-top:10px}.mvg .mgk span{display:inline-flex;gap:6px;align-items:center}.mvg .mgk i{width:10px;height:10px;border-radius:3px;display:inline-block}.mvg .mgk i.o{background:transparent!important;box-shadow:inset 0 0 0 1.5px var(--gt)}'
   +'.mvg .mgring .bg{stroke:var(--g3)}.mvg .mgring .fg{stroke:var(--g1)}.mvg .mgring text{fill:var(--gi);font-family:inherit}'
   +'.mvg .mgch{width:100%;min-height:60px}.mvg .mgch svg{display:block}.mvg .mgch text{font-size:11px;fill:var(--gt);font-family:inherit}.mvg .mgch .bar{fill:var(--g1)}.mvg .mgch .ln{fill:none;stroke:var(--g1);stroke-width:2;stroke-linejoin:round}.mvg .mgch .ar{fill:var(--g1);opacity:.12}.mvg .mgch .gd{stroke:var(--gb);stroke-width:1}.mvg .mgch .gd.d{stroke-dasharray:3 4}.mvg .mgch .hit{fill:transparent}.mvg .mgch .hit:hover{fill:color-mix(in srgb,var(--gi) 7%,transparent)}.mvg .mgch .pt{fill:var(--g1);stroke:var(--gs);stroke-width:2}'
   +'.mvg [data-tip]{cursor:default}.mvg details{margin-top:10px;font-size:12px}.mvg details summary{cursor:pointer;color:var(--gt)}'
   +'#gTip{position:fixed;z-index:2147483200;pointer-events:none;background:var(--ink,#2b3038);color:var(--sheet,#fff);padding:6px 9px;border-radius:7px;font-size:12px;line-height:1.35;max-width:280px;opacity:0;transition:opacity .12s;box-shadow:0 6px 18px rgba(0,0,0,.25)}'
   +'@media (prefers-reduced-motion:reduce){#gTip{transition:none}}'+'.rsW{container-type:inline-size}.rsW{display:flex;flex-direction:column;gap:14px}.rsK{display:grid;grid-template-columns:minmax(300px,2fr) repeat(auto-fit,minmax(150px,1fr));gap:14px}.rsK1{background:var(--sheet);border:1px solid var(--rule);border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:4px;min-width:0}.rsK1 .l{font-size:12px;color:var(--muted)}.rsK1 .v{font-size:26px;font-weight:650;line-height:1.15;font-variant-numeric:tabular-nums;color:var(--ink)}.rsK1 .v small{font-size:13px;font-weight:500;color:var(--muted)}.rsK1 .s{font-size:12px;color:var(--muted);line-height:1.35}.rsK1.hero{flex-direction:row;align-items:center;gap:18px}.rsK1.hero>div{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}.rsK1.hero .v{font-size:30px}.rsSeg{display:flex;gap:2px;height:8px;margin-top:8px}.rsSeg i{border-radius:3px}.rsSeg .c{background:var(--g1)}.rsSeg .p{background:var(--g2)}.rsSeg .n{background:var(--g3)}.rsSeg .v{box-shadow:inset 0 0 0 1.5px var(--muted)}.rsG{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}.rsG>.s12{grid-column:span 12}.rsG>.s7{grid-column:span 7}.rsG>.s6{grid-column:span 6}.rsG>.s5{grid-column:span 5}@container (max-width:900px){.rsG>.s7,.rsG>.s6,.rsG>.s5{grid-column:span 12}}@container (max-width:1050px){.rsK{grid-template-columns:repeat(4,minmax(0,1fr))}.rsK1.hero{grid-column:span 4}}@container (max-width:780px){.rsK{grid-template-columns:repeat(2,minmax(0,1fr))}.rsK1.hero{grid-column:span 2}}@container (max-width:470px){.rsK{grid-template-columns:minmax(0,1fr)}.rsK1.hero{grid-column:auto;flex-direction:column;align-items:flex-start}}.rsCh{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}.rsCh .mgk{margin-top:2px}.rsMapa{display:flex;flex-direction:column;gap:8px;margin-top:4px}.rsMl{display:grid;grid-template-columns:minmax(90px,150px) minmax(0,1fr);gap:12px;align-items:start}.rsMg{display:flex;flex-direction:column;font-size:12px;line-height:1.3;padding-top:1px}.rsMg b{font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rsMg span{color:var(--muted);font-variant-numeric:tabular-nums}.rsMq{display:flex;flex-wrap:wrap;gap:3px}.rsMq .q{width:15px!important;height:15px!important;min-width:0!important;min-height:0!important;flex:0 0 15px;padding:0!important;border:0!important;margin:0;box-sizing:border-box;border-radius:4px;cursor:pointer;transition:transform .1s}.rsMq .q:hover{transform:scale(1.25)}.rsMq .q:focus-visible{outline:2px solid var(--ink);outline-offset:1px}.rsMq .q[disabled]{cursor:default}.rsMq .q.c{background:var(--g1)}.rsMq .q.p{background:var(--g2)}.rsMq .q.n{background:var(--g3)}.rsMq .q.v{background:transparent;box-shadow:inset 0 0 0 1.5px var(--muted)}.rsLst{max-height:300px;overflow:auto;margin:0 -6px;padding:0 6px}.rsNada{font-size:12.5px;color:var(--muted);padding:26px 4px;text-align:center}.rsVaz{background:var(--sheet);border:1px dashed var(--rule);border-radius:12px;padding:38px 24px;text-align:center}.rsVaz b{font-size:15px}.rsVaz p{color:var(--muted);font-size:13px;margin:8px auto 16px;max-width:460px}.rsAv{padding:10px 14px;border:1px solid var(--amberbd,#E8D5A8);background:var(--amberbg);color:var(--ink);border-radius:10px;font-size:13px}@media (prefers-reduced-motion:reduce){.rsMq .q{transition:none}}';
  var e=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var f=function(n,d){return Number(n||0).toLocaleString('pt-PT',{minimumFractionDigits:0,maximumFractionDigits:d==null?1:d})};
  var G={e:e,f:f,css:css},REG={},nr=0;
  G.donut=function(p,sub,sz){p=Math.max(0,Math.min(1,p||0));sz=sz||132;var r=sz/2-10,c=2*Math.PI*r,h=sz/2;
    return '<svg class="mgring" width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'" role="img" aria-label="'+e(Math.round(p*100)+'% '+(sub||''))+'"><circle class="bg" cx="'+h+'" cy="'+h+'" r="'+r+'" fill="none" stroke-width="12"/>'
     +(p>0?'<circle class="fg" cx="'+h+'" cy="'+h+'" r="'+r+'" fill="none" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+(c*p).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 '+h+' '+h+')"/>':'')
     +'<text x="'+h+'" y="'+(h+9)+'" text-anchor="middle" font-size="'+Math.round(sz*.21)+'" font-weight="650">'+Math.round(p*100)+'%</text></svg>'};
  G.stack=function(rows,un){var mx=0;rows.forEach(function(r){if(r.t>mx)mx=r.t});un=un||'';
    return rows.map(function(r){var w=mx?r.t/mx*100:0,pa=r.t?Math.min(1,r.a/r.t):0,tip=r.tip||(r.l+': '+f(r.a)+' de '+f(r.t)+un+' ('+Math.round(pa*100)+'%)');
      return '<div class="mgr" data-tip="'+e(tip)+'"><span class="mgl" title="'+e(r.l)+'">'+e(r.l)+'</span><div class="mgtk" style="width:'+Math.max(w,3).toFixed(1)+'%">'+(pa>0?'<i class="a" style="flex:'+(pa*100).toFixed(2)+'"></i>':'')+(pa<1?'<i class="b" style="flex:'+((1-pa)*100).toFixed(2)+'"></i>':'')+'</div><span class="mgv">'+(r.v!=null?r.v:f(r.a)+' / '+f(r.t)+un+' · '+Math.round(pa*100)+'%')+'</span></div>'}).join('')};
  G.cmp=function(rows,un){var mx=0;rows.forEach(function(r){mx=Math.max(mx,r.prev,r.real)});un=un||' m';
    return rows.map(function(r){var wp=mx?r.prev/mx*100:0,wr=mx?r.real/mx*100:0,tip=r.l+': previsto '+f(r.prev)+un+', gasto '+f(r.real)+un+(r.exc>0?', a mais '+f(r.exc)+un:'');
      return '<div class="mgr" data-tip="'+e(tip)+'"><span class="mgl" title="'+e(r.l)+'">'+e(r.l)+'</span><div style="display:flex;flex-direction:column;gap:3px"><div class="mgtk" style="width:'+Math.max(wp,1).toFixed(1)+'%"><i class="c" style="flex:1"></i></div><div class="mgtk" style="width:'+Math.max(wr,r.real>0?1:0).toFixed(1)+'%"><i class="'+(r.exc>0?'w':'a')+'" style="flex:1"></i></div></div><span class="mgv">'+f(r.real)+' / '+f(r.prev)+un+(r.exc>0?' · ▲ +'+f(r.exc)+un:'')+'</span></div>'}).join('')};
  G.leg=function(a){return '<div class="mgk">'+a.map(function(x){return '<span><i'+(x[0]==='o'?' class="o"':' style="background:var(--'+x[0]+')"')+'></i>'+e(x[1])+'</span>'}).join('')+'</div>'};
  var lugar=function(tipo,dados,h){var id='c'+(++nr);REG[id]={t:tipo,d:dados,h:h||170};return '<div class="mgch" data-mgc="'+id+'" style="height:'+(h||170)+'px"></div>'};
  G.cols=function(items,un,h){return items.length?lugar('cols',{it:items,un:un||''},h):''};
  G.curva=function(pts,h){return pts.length?lugar('curva',{p:pts},h):''};
  var rr=function(x,y,w,h,r){r=Math.min(r,w/2,h);return 'M'+x+' '+(y+h)+'V'+(y+r)+'Q'+x+' '+y+' '+(x+r)+' '+y+'H'+(x+w-r)+'Q'+(x+w)+' '+y+' '+(x+w)+' '+(y+r)+'V'+(y+h)+'Z'};
  var nice=function(m){if(m<=0)return 1;var p=Math.pow(10,Math.floor(Math.log10(m))),n=m/p;return (n<=1?1:n<=2?2:n<=5?5:10)*p};
  var DESENHA={
    cols:function(W,H,d){var it=d.it,pl=34,pr=8,pt=14,pb=24,mx=0;it.forEach(function(i){if(i.v>mx)mx=i.v});var top=nice(mx),iw=W-pl-pr,ih=H-pt-pb,st=iw/it.length,bw=Math.max(6,Math.min(34,st*.62));
      var o='<svg width="'+W+'" height="'+H+'" role="img" aria-label="Colunas por mês">';
      [0,.5,1].forEach(function(k){if(k===.5&&top%2)return;var y=pt+ih*(1-k);o+='<line class="gd'+(k?' d':'')+'" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'"/><text x="'+(pl-6)+'" y="'+(y+4)+'" text-anchor="end">'+f(top*k,0)+'</text>'});
      var cada=Math.max(1,Math.ceil(it.length/Math.max(1,Math.floor(iw/52))));
      it.forEach(function(i,k){var h=ih*i.v/top,x=pl+st*k+(st-bw)/2,y=pt+ih-h;
        o+='<g data-tip="'+e(i.l+': '+f(i.v)+(d.un||'')+(i.cum!=null?' · acumulado '+f(i.cum)+(d.un||''):''))+'"><rect class="hit" x="'+(pl+st*k)+'" y="'+pt+'" width="'+st+'" height="'+ih+'"/>'+(h>0?'<path class="bar" d="'+rr(x,y,bw,h,4)+'"/>':'')
          +(k%cada===0?'<text x="'+(x+bw/2)+'" y="'+(H-7)+'" text-anchor="middle">'+e(i.l)+'</text>':'')+'</g>'});
      return o+'</svg>'},
    curva:function(W,H,d){var p=d.p,pl=38,pr=14,pt=12,pb=24,iw=W-pl-pr,ih=H-pt-pb,t0=p[0].t,t1=p[p.length-1].t;if(t1===t0)t1=t0+864e5;
      var X=function(t){return pl+iw*(t-t0)/(t1-t0)},Y=function(v){return pt+ih*(1-v)};
      var o='<svg width="'+W+'" height="'+H+'" role="img" aria-label="Curva de execução acumulada">';
      [0,.25,.5,.75,1].forEach(function(k){o+='<line class="gd'+(k?' d':'')+'" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(k)+'" y2="'+Y(k)+'"/><text x="'+(pl-6)+'" y="'+(Y(k)+4)+'" text-anchor="end">'+(k*100)+'%</text>'});
      var ln=p.map(function(q,k){return (k?'L':'M')+X(q.t).toFixed(1)+' '+Y(q.v).toFixed(1)}).join('');
      o+='<path class="ar" d="'+ln+'L'+X(p[p.length-1].t).toFixed(1)+' '+Y(0)+'L'+X(p[0].t).toFixed(1)+' '+Y(0)+'Z"/><path class="ln" d="'+ln+'"/>';
      var n=Math.max(2,Math.min(6,Math.floor(iw/90)));for(var k=0;k<=n;k++){var t=t0+(t1-t0)*k/n,dt=new Date(t);o+='<text x="'+X(t).toFixed(1)+'" y="'+(H-7)+'" text-anchor="'+(k===0?'start':k===n?'end':'middle')+'">'+dt.getDate()+' '+['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][dt.getMonth()]+'</text>'}
      p.forEach(function(q,k){var x0=k?(X(p[k-1].t)+X(q.t))/2:pl,x1=k<p.length-1?(X(q.t)+X(p[k+1].t))/2:W-pr;o+='<rect class="hit" data-tip="'+e(q.l)+'" x="'+x0.toFixed(1)+'" y="'+pt+'" width="'+Math.max(1,x1-x0).toFixed(1)+'" height="'+ih+'"/>'});
      var u=p[p.length-1];o+='<circle class="pt" cx="'+X(u.t).toFixed(1)+'" cy="'+Y(u.v).toFixed(1)+'" r="4.5"/>';
      return o+'</svg>'}};
  var ro=window.ResizeObserver?new ResizeObserver(function(es){es.forEach(function(en){desenha(en.target)})}):null;
  function desenha(el){var r=REG[el.getAttribute('data-mgc')];if(!r)return;var W=Math.floor(el.clientWidth);if(!W||W===el.__w)return;el.__w=W;el.innerHTML=DESENHA[r.t](W,r.h,r.d)}
  G.monta=function(raiz){(raiz||document).querySelectorAll('.mgch[data-mgc]').forEach(function(el){desenha(el);if(ro)ro.observe(el)})};
  if(!ro)addEventListener('resize',function(){document.querySelectorAll('.mgch[data-mgc]').forEach(function(el){el.__w=0;desenha(el)})});
  window.MVG=G;
  var st=document.createElement('style');st.id='mv-graf';st.textContent=css;(document.head||document.documentElement).appendChild(st);
  var tp=null,mv=function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('[data-tip]');
    if(!t||!t.closest('.mvg')){if(tp)tp.style.opacity=0;return}
    if(!tp){tp=document.createElement('div');tp.id='gTip';tp.setAttribute('role','tooltip');document.body.appendChild(tp)}
    tp.textContent=t.getAttribute('data-tip');tp.style.opacity=1;var w=tp.offsetWidth,x=Math.min(innerWidth-w-8,ev.clientX+12),y=ev.clientY+16;if(y+tp.offsetHeight>innerHeight)y=ev.clientY-tp.offsetHeight-12;tp.style.left=Math.max(4,x)+'px';tp.style.top=y+'px'};
  document.addEventListener('mousemove',mv);document.addEventListener('mouseleave',function(){if(tp)tp.style.opacity=0},true);
}catch(x){}})();
