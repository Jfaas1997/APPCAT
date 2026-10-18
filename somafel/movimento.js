/* Camada de movimento · utilitários (opcionais) */
window.Mov={
  /* esqueleto de carregamento: Mov.skel(3) → 3 blocos; Mov.skel(2,'b') → cartões */
  skel:function(n,tipo){var h='';for(var i=0;i<(n||3);i++)h+='<span class="skel '+(tipo||(i%3===2?'s':'m'))+'"></span>';return '<div class="mv-skel" aria-busy="true" aria-label="A carregar">'+h+'</div>'},
  /* número que sobe até ao valor (indicadores) */
  conta:function(el,para,ms){if(matchMedia('(prefers-reduced-motion:reduce)').matches){el.textContent=para;return}var t0=performance.now(),de=+el.dataset.v||0;ms=ms||500;
    (function f(t){var k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);el.textContent=Math.round(de+(para-de)*e);if(k<1)requestAnimationFrame(f);else el.dataset.v=para})(t0)}
};
