/* Visualizador de DWG/DXF (2D). Lê o ficheiro no próprio navegador com libredwg-web (WebAssembly) e desenha em canvas.
   Uso: DwgView.abre(elemento, ArrayBuffer, {nome, aoErro}) -> {destroi()} */
(function(){
const LIB='https://cdn.jsdelivr.net/npm/@mlightcad/libredwg-web@0.8.2/';
let libP=null;
function carregaLib(base){
  base=base||window.DWG_BASE||LIB;
  if(!libP)libP=import(base+'dist/libredwg-web.js').then(async m=>({m,lib:await m.LibreDwg.create(base+'wasm/')})).catch(e=>{libP=null;throw new Error('Não consegui carregar o leitor de DWG (sem rede?).')});
  return libP}
/* paleta ACI (AutoCAD Color Index) */
function aci(i){
  const f={1:'#ff0000',2:'#ffff00',3:'#00ff00',4:'#00ffff',5:'#0000ff',6:'#ff00ff',7:'#ffffff',8:'#808080',9:'#c0c0c0'};
  if(f[i])return f[i];
  if(i>=250&&i<=255)return ['#333333','#505050','#696969','#828282','#bebebe','#ffffff'][i-250];
  if(i>=10&&i<=249){const h=Math.floor((i-10)/10)*15,r=(i-10)%10,v=[1,.65,.5,.3,.15][r>>1],s=r%2?.5:1;
    const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let R=0,G=0,B=0;
    if(h<60){R=c;G=x}else if(h<120){R=x;G=c}else if(h<180){G=c;B=x}else if(h<240){G=x;B=c}else if(h<300){R=x;B=c}else{R=c;B=x}
    const hx=n=>('0'+Math.round((n+m)*255).toString(16)).slice(-2);return '#'+hx(R)+hx(G)+hx(B)}
  return '#ffffff'}
const rgbHex=n=>'#'+('000000'+(n&0xffffff).toString(16)).slice(-6);
const mul=(A,B)=>[A[0]*B[0]+A[2]*B[1],A[1]*B[0]+A[3]*B[1],A[0]*B[2]+A[2]*B[3],A[1]*B[2]+A[3]*B[3],A[0]*B[4]+A[2]*B[5]+A[4],A[1]*B[4]+A[3]*B[5]+A[5]];
const ap=(M,x,y)=>[M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]];
const limpaTxt=t=>String(t||'').replace(/\\P/g,'\n').replace(/\\[Ff][^;]*;/g,'').replace(/\\[CcHhWwQqTtAaLlOoKk][^;\\]*;?/g,'').replace(/\\[LlOoKk]/g,'').replace(/%%[Cc]/g,'Ø').replace(/%%[Dd]/g,'°').replace(/%%[Pp]/g,'±').replace(/[{}]/g,'').replace(/\\\\/g,'\\');

function achata(db){
  const prim=[],blocos={};(db.tables.BLOCK_RECORD.entries||[]).forEach(b=>blocos[b.name]=b);
  const lay={};((db.tables.LAYER||{}).entries||[]).forEach(l=>lay[l.name]=l);
  const camadas=new Set();
  const cor=(e,herda)=>{let ci=e.colorIndex;
    if(ci===0)return herda||'#ffffff';
    if(ci===256||ci==null){const l=lay[e.layer];ci=l?Math.abs(l.colorIndex):7;if(l&&l.color&&ci===7&&false)return rgbHex(l.color);return ci===7?'#ffffff':aci(ci)}
    if(ci===257)return herda||'#ffffff';
    return ci===7?'#ffffff':aci(ci)};
  const visivel=e=>{const l=lay[e.layer];return e.isVisible!==false&&!(l&&(l.off||l.frozen))};
  const arco=(cx,cy,r,a0,a1,M,pts)=>{let d=a1-a0;while(d<=0)d+=Math.PI*2;const n=Math.max(8,Math.ceil(d/(Math.PI/36)));for(let i=0;i<=n;i++){const a=a0+d*i/n;pts.push(ap(M,cx+r*Math.cos(a),cy+r*Math.sin(a)))}};
  const bulgeSeg=(p,q,b,M,pts)=>{const dx=q.x-p.x,dy=q.y-p.y,c=Math.hypot(dx,dy);if(!c)return;
    const d=c*(1-b*b)/(4*b),cx=(p.x+q.x)/2-dy/c*d,cy=(p.y+q.y)/2+dx/c*d,r=Math.abs(c*(1+b*b)/(4*b)),th=4*Math.atan(b),a0=Math.atan2(p.y-cy,p.x-cx),n=Math.max(4,Math.ceil(Math.abs(th)/(Math.PI/36)));
    for(let i=1;i<=n;i++){const a=a0+th*i/n;pts.push(ap(M,cx+r*Math.cos(a),cy+r*Math.sin(a)))}};
  const poli=(e,vs,fechada,M,c)=>{if(!vs||vs.length<1)return;const pts=[ap(M,vs[0].x,vs[0].y)];
    const n=vs.length;for(let i=0;i<(fechada?n:n-1);i++){const p=vs[i],q=vs[(i+1)%n];if(p.bulge)bulgeSeg(p,q,p.bulge,M,pts);else pts.push(ap(M,q.x,q.y))}
    prim.push({k:'L',pts,c,l:e.layer})};
  const txt=(t,x,y,h,rot,M,c,l,ancora)=>{if(!t)return;const p=ap(M,x,y),sc=Math.hypot(M[0],M[1]),ro=rot+Math.atan2(M[1],M[0]);prim.push({k:'T',t:limpaTxt(t),x:p[0],y:p[1],h:(h||1)*sc,r:ro,c,l,a:ancora||0})};
  const desenha=(es,M,herda,prof)=>{es.forEach(e=>{if(!visivel(e))return;const c=cor(e,herda);camadas.add(e.layer);
    switch(e.type){
      case'LINE':prim.push({k:'L',pts:[ap(M,e.startPoint.x,e.startPoint.y),ap(M,e.endPoint.x,e.endPoint.y)],c,l:e.layer});break;
      case'LWPOLYLINE':poli(e,e.vertices,(e.flag&1)||(e.flag&512),M,c);break;
      case'POLYLINE2D':case'POLYLINE3D':poli(e,e.vertices,(e.flag&1),M,c);break;
      case'ARC':{const pts=[];arco(e.center.x,e.center.y,e.radius,e.startAngle,e.endAngle,M,pts);prim.push({k:'L',pts,c,l:e.layer});break}
      case'CIRCLE':{const pts=[];arco(e.center.x,e.center.y,e.radius,0,Math.PI*2+.0001,M,pts);prim.push({k:'L',pts,c,l:e.layer});break}
      case'ELLIPSE':{const mx=e.majorAxisEndPoint.x,my=e.majorAxisEndPoint.y,a=Math.hypot(mx,my),b=a*e.axisRatio,rot=Math.atan2(my,mx);let a0=e.startAngle||0,a1=e.endAngle||Math.PI*2;if(a1<=a0)a1+=Math.PI*2;if(a1-a0>Math.PI*2+.01)a1=a0+Math.PI*2;
        const pts=[],n=72;for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n,x=a*Math.cos(t),y=b*Math.sin(t);pts.push(ap(M,e.center.x+x*Math.cos(rot)-y*Math.sin(rot),e.center.y+x*Math.sin(rot)+y*Math.cos(rot)))}prim.push({k:'L',pts,c,l:e.layer});break}
      case'TEXT':txt(e.text,e.startPoint.x,e.startPoint.y,e.textHeight,e.rotation||0,M,c,e.layer,0);break;
      case'MTEXT':{const rot=e.direction&&(e.direction.x||e.direction.y)?Math.atan2(e.direction.y,e.direction.x):(e.rotation||0);txt(e.text,e.insertionPoint.x,e.insertionPoint.y,e.textHeight,rot,M,c,e.layer,e.attachmentPoint||1);break}
      case'ATTRIB':case'ATTDEF':{const t=e.text&&typeof e.text==='object'?e.text:e;if(e.isInvisible||(e.flags&1))break;txt(t.text,(t.startPoint||{}).x,(t.startPoint||{}).y,t.textHeight,t.rotation||0,M,c,e.layer,0);break}
      case'SOLID':{const v=[e.corner1,e.corner2,e.corner4||e.corner3,e.corner3].filter(Boolean);if(v.length>2)prim.push({k:'L',pts:v.map(p=>ap(M,p.x,p.y)).concat([ap(M,v[0].x,v[0].y)]),c,l:e.layer});break}
      case'INSERT':{if(prof>6)break;const b=blocos[e.name];if(!b||!b.entities)break;
        const sx=e.xScale||1,sy=e.yScale||1,r=e.rotation||0,cr=Math.cos(r),sr=Math.sin(r),bp=b.basePoint||{x:0,y:0};
        const T=[cr*sx,sr*sx,-sr*sy,cr*sy,e.insertionPoint.x,e.insertionPoint.y],B=mul(T,[1,0,0,1,-bp.x,-bp.y]);
        desenha(b.entities,mul(M,B),c,prof+1);(e.attribs||[]).forEach(a=>desenha([a],M,c,prof+1));break}
    }})};
  /* só o espaço-modelo: entidades de topo (as dos blocos entram via INSERT) */
  desenha(db.entities,[1,0,0,1,0,0],'#ffffff',0);
  return {prim,camadas:[...camadas].sort(),lay}}

function abre(el,buf,op){
  op=op||{};const R={};el.innerHTML='';el.style.position='relative';el.style.background='#111';el.style.overflow='hidden';el.style.touchAction='none';
  const cv=document.createElement('canvas');cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';el.appendChild(cv);
  const msg=document.createElement('div');msg.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#ddd;font:14px Arial,sans-serif;text-align:center;padding:12px';msg.textContent='A abrir o desenho…';el.appendChild(msg);
  const barra=document.createElement('div');barra.style.cssText='position:absolute;right:8px;top:8px;display:flex;gap:6px;z-index:2';
  const bt=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.style.cssText='background:#fff;color:#111;border:0;border-radius:6px;padding:7px 11px;font:600 13px Arial,sans-serif;cursor:pointer;opacity:.92';b.onclick=f;barra.appendChild(b);return b};
  let D=null,V={s:1,x:0,y:0},oculta=new Set(),vivo=true,painel=null;
  const ctx=cv.getContext('2d');
  const tam=()=>{const r=el.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.max(1,r.width*d);cv.height=Math.max(1,r.height*d);R.d=d;R.w=r.width;R.h=r.height;desenha()};
  const ajusta=()=>{if(!D)return;const b=D.bb,w=b.x1-b.x0||1,h=b.y1-b.y0||1,s=Math.min(R.w/w,R.h/h)*.94;V.s=s;V.x=(R.w-w*s)/2-b.x0*s;V.y=(R.h+h*s)/2+b.y0*s;desenha()};
  const X=(x,y)=>[x*V.s+V.x,-y*V.s+V.y];
  let raf=0;const desenha=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;pinta()})};
  const pinta=()=>{if(!vivo)return;const d=R.d||1;ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#111';ctx.fillRect(0,0,R.w,R.h);if(!D)return;
    ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=1;const x0=-20,y0=-20,x1=R.w+20,y1=R.h+20;
    let cor=null;ctx.beginPath();
    const flush=()=>{ctx.stroke();ctx.beginPath()};
    const porCor={};D.prim.forEach(p=>{if(p.k!=='L'||oculta.has(p.l))return;(porCor[p.c]=porCor[p.c]||[]).push(p)});
    Object.keys(porCor).forEach(c=>{ctx.strokeStyle=c;ctx.beginPath();porCor[c].forEach(p=>{const q=p.pts;let mnx=1e99,mxx=-1e99,mny=1e99,mxy=-1e99;const S=q.map(a=>{const s=X(a[0],a[1]);if(s[0]<mnx)mnx=s[0];if(s[0]>mxx)mxx=s[0];if(s[1]<mny)mny=s[1];if(s[1]>mxy)mxy=s[1];return s});
      if(mxx<x0||mnx>x1||mxy<y0||mny>y1)return;if(mxx-mnx<.3&&mxy-mny<.3)return;ctx.moveTo(S[0][0],S[0][1]);for(let i=1;i<S.length;i++)ctx.lineTo(S[i][0],S[i][1])});ctx.stroke()});
    ctx.textBaseline='alphabetic';
    D.prim.forEach(p=>{if(p.k!=='T'||oculta.has(p.l))return;const fh=p.h*V.s;if(fh<3.5)return;const s=X(p.x,p.y);if(s[0]<-200||s[0]>R.w+200||s[1]<-200||s[1]>R.h+200)return;
      ctx.save();ctx.translate(s[0],s[1]);ctx.rotate(-p.r);ctx.fillStyle=p.c;ctx.font=Math.max(4,fh)+'px Arial,sans-serif';
      const ls=p.t.split('\n');const a=p.a;/* MTEXT: 1-3 topo, 4-6 meio, 7-9 base; 1/4/7 esq, 2/5/8 centro, 3/6/9 dir */
      if(a>=1){ctx.textAlign=[0,'left','center','right'][((a-1)%3)+1];const lin=ls.length;const off=a<=3?fh:(a<=6?fh*(1-lin/2)+fh*.0:fh*(1-lin));ls.forEach((t,i)=>ctx.fillText(t,0,off+i*fh*1.25))}
      else{ctx.textAlign='left';ls.forEach((t,i)=>ctx.fillText(t,0,i*fh*1.25))}
      ctx.restore()})};
  const zoom=(f,cx,cy)=>{const wx=(cx-V.x)/V.s,wy=-(cy-V.y)/V.s;V.s*=f;V.x=cx-wx*V.s;V.y=cy+wy*V.s;desenha()};
  /* gestos: arrastar, roda, pinça */
  const ptr=new Map();let ultimo=null;
  el.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('[data-nodrag]'))return;el.setPointerCapture(e.pointerId);ptr.set(e.pointerId,[e.clientX,e.clientY]);ultimo=null});
  el.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId))return;const o=ptr.get(e.pointerId),n=[e.clientX,e.clientY];
    if(ptr.size===1){V.x+=n[0]-o[0];V.y+=n[1]-o[1];ptr.set(e.pointerId,n);desenha()}
    else if(ptr.size===2){const ks=[...ptr.keys()],a=ptr.get(ks[0]),b=ptr.get(ks[1]);const d0=Math.hypot(a[0]-b[0],a[1]-b[1]);ptr.set(e.pointerId,n);const a2=ptr.get(ks[0]),b2=ptr.get(ks[1]),d1=Math.hypot(a2[0]-b2[0],a2[1]-b2[1]);
      const r=el.getBoundingClientRect();if(d0>0)zoom(d1/d0,(a2[0]+b2[0])/2-r.left,(a2[1]+b2[1])/2-r.top)}});
  const fimP=e=>ptr.delete(e.pointerId);el.addEventListener('pointerup',fimP);el.addEventListener('pointercancel',fimP);
  el.addEventListener('wheel',e=>{e.preventDefault();const r=el.getBoundingClientRect();zoom(e.deltaY<0?1.25:.8,e.clientX-r.left,e.clientY-r.top)},{passive:false});
  el.addEventListener('dblclick',ajusta);
  const ro=new ResizeObserver(tam);ro.observe(el);
  R.destroi=()=>{vivo=false;ro.disconnect();el.innerHTML=''};
  (async()=>{try{
    const {m,lib}=await carregaLib(op.base);
    const ext=(op.nome||'').toLowerCase().endsWith('.dxf')?m.Dwg_File_Type.DXF:m.Dwg_File_Type.DWG;
    const dwg=lib.dwg_read_data(buf,ext);if(!dwg)throw new Error('Não consegui ler este ficheiro.');
    const db=lib.convert(dwg);try{lib.dwg_free(dwg)}catch(_){}
    const A=achata(db);if(!A.prim.length)throw new Error('O desenho não tem elementos 2D para mostrar.');
    /* limites robustos (ignora entidades isoladas muito longe) */
    const xs=[],ys=[];A.prim.forEach(p=>{if(p.k==='L')p.pts.forEach(a=>{xs.push(a[0]);ys.push(a[1])});else{xs.push(p.x);ys.push(p.y)}});
    xs.sort((a,b)=>a-b);ys.sort((a,b)=>a-b);const q=(v,f)=>v[Math.min(v.length-1,Math.max(0,Math.floor(f*(v.length-1))))];
    A.bb={x0:q(xs,.003),x1:q(xs,.997),y0:q(ys,.003),y1:q(ys,.997)};D=A;msg.remove();
    bt('Ajustar',ajusta);bt('+',()=>zoom(1.4,R.w/2,R.h/2));bt('−',()=>zoom(1/1.4,R.w/2,R.h/2));
    const bc=bt('Camadas',()=>{if(painel){painel.remove();painel=null;return}painel=document.createElement('div');painel.dataset.nodrag='1';painel.style.cssText='position:absolute;right:8px;top:48px;max-height:70%;overflow:auto;background:#fff;color:#111;border-radius:8px;padding:8px 10px;font:12.5px Arial,sans-serif;z-index:3;min-width:180px';
      painel.innerHTML='<div style="display:flex;gap:6px;margin-bottom:6px"><button data-a="t">Todas</button><button data-a="n">Nenhuma</button></div>'+D.camadas.map(c=>'<label style="display:flex;gap:6px;align-items:center;margin:2px 0;white-space:nowrap"><input type="checkbox" data-c="'+c.replace(/"/g,'&quot;')+'" '+(oculta.has(c)?'':'checked')+'> '+c.replace(/</g,'&lt;')+'</label>').join('');
      painel.onchange=e=>{const c=e.target.dataset.c;if(c==null)return;e.target.checked?oculta.delete(c):oculta.add(c);desenha()};
      painel.onclick=e=>{const a=e.target.dataset.a;if(!a)return;oculta=a==='t'?new Set():new Set(D.camadas);painel.querySelectorAll('[data-c]').forEach(i=>i.checked=a==='t');desenha()};el.appendChild(painel)});
    el.appendChild(barra);tam();ajusta();R.pronto=true;op.aoPronto&&op.aoPronto(A);
  }catch(err){msg.innerHTML='<span style="color:#ffb4b4">'+(err.message||err)+'</span>';op.aoErro&&op.aoErro(err)}})();
  return R}
window.DwgView={abre,_achata:achata};
})();
