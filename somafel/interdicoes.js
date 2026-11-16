/* Somafel Catenária · Interdições: PTI (pedido trimestral de interdições) e pedidos de interdição.
   Os pedidos que a Somafel faz dão origem às OS da IP. Editor ao estilo do PDT: formulário à esquerda,
   pré-visualização e esquemas (sinalização e elétrico) à direita. Usa as funções globais da Central. */
let PIS = [];
const PI_TIPOS = ['I/CT', 'I/CGT', 'I', 'CT', 'CGT'];
const PI_VIAS = ['VA', 'VD', 'VA,VD', 'VU'];
const PI_DOW = ['Dom', '2ª', '3ª', '4ª', '5ª', '6ª', 'Sáb'];
const PI_MOD = () => '_org/' + S.eu.organizacao_id + '/modelos/pedido_interdicao.xlsx';
const PI_MOD_PTI = () => '_org/' + S.eu.organizacao_id + '/modelos/pti.xlsx';
const PI_COLS = [['d', 'Data', 104, 'date'], ['hi', 'Início', 66], ['hf', 'Fim', 66], ['tp', 'Tipo', 70, 'tp'], ['via', 'Via', 66, 'via'], ['ei', 'Estação início', 130], ['si', 'Sinal', 90], ['pi', 'Poste limite', 90], ['ef', 'Estação fim', 130], ['sf', 'Sinal', 90], ['pf', 'Poste limite', 90], ['tr', 'Trabalhos a executar', 220]];
const carregaExcelJS = () => carregaJs('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js', () => window.ExcelJS);

/* datas e horas */
const piD = s => new Date(String(s).slice(0, 10) + 'T12:00:00');
const piIso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function piSemana(s) { const d = piD(s), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return { s: Math.ceil(((t - y) / 864e5 + 1) / 7), a: t.getUTCFullYear() } }
const piReg = s => piD(s).getDay() + 1; /* 1 = domingo … 7 = sábado (como no PTI da IP) */
const piMin = h => { const m = /^(\d{1,2})[:h.](\d{2})/.exec(String(h || '').trim()); return m ? (+m[1]) * 60 + (+m[2]) : null };
const piHH = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const piDur = (a, b) => { const x = piMin(a), y = piMin(b); if (x == null || y == null) return ''; let d = y - x; if (d < 0) d += 1440; return piHH(d) };
const piFmt = s => s ? fmtData(String(s).slice(0, 10)) : '';
const piOrd = L => L.slice().sort((a, b) => (a.d || '').localeCompare(b.d || '') || (piMin(a.hi) ?? 0) - (piMin(b.hi) ?? 0));
const piVazioP = () => ({ linha: 'Norte', sem: '', num: '', desc: '', via: 'VA', viaLinha: 'Norte', pkI: '', pkF: '', periodo: 'normal', just: '', prog: { int: true, ct: true, sca: false, outro: '' }, rv: false, estI: '', estF: '', diagI: '', diagF: '', pep: '', per: [], intLinha: false, intEst: '', sinI: '', sinF: '', ctLinha: false, ctEst: '', posI: '', posF: '', se: '', meios: '', meiosES: '', chefe: [{ n: '', c: '' }, { n: '', c: '' }], anexa: false, obs: '', ent: 'Somafel', data: piIso(new Date()), os: '' });

async function piCarrega(o) { try { PIS = await ok(sb.from('pedidos_interdicao').select('*').eq('obra_id', o.id).order('atualizado_em', { ascending: false })) } catch (e) { PIS = [] } }

function piTabela(tipo) {
  const L = PIS.filter(x => x.tipo === tipo);
  const bt = tipo === 'pti' ? '<button class="pri" data-pin="pti">+ Novo PTI</button><button data-pimp="1">Importar PTI do Excel…</button><button data-pmodp="1">Modelo Excel do PTI…</button>'
    : '<button class="pri" data-pin="pedido">+ Novo pedido</button>' + (PIS.some(x => x.tipo === 'pti') ? '<button data-pdpti="1">Pedidos a partir do PTI…</button>' : '') + '<button data-pmod="1">Modelo Excel da IP…</button>';
  let h = '<div style="display:flex;gap:8px;flex-wrap:wrap;padding:10px 14px">' + bt + '</div>';
  if (!L.length) return h + '<p class="hint" style="margin:4px 14px 14px">' + (tipo === 'pti' ? 'Ainda não há PTI nesta obra. Cria um ou importa o Excel do PTI.' : 'Ainda não há pedidos de interdição. Cria um à mão ou a partir de uma semana do PTI.') + '</p>';
  const info = x => { const d = x.dados || {}; if (tipo === 'pti') { const r = piOrd(d.rows || []); return [(r.length ? piFmt(r[0].d) + ' a ' + piFmt(r[r.length - 1].d) : '—'), r.length + ' período' + (r.length === 1 ? '' : 's')] }
    const p = (d.per || []).filter(q => q.d); return ['Semana ' + esc(d.sem || '—') + ' · ' + esc(d.via || ''), p.length + ' período' + (p.length === 1 ? '' : 's') + (d.os ? ' · <b>OS ' + esc(d.os) + '</b>' : '')] };
  return h + '<table><thead><tr><th>' + (tipo === 'pti' ? 'PTI' : 'Pedido') + '</th><th>' + (tipo === 'pti' ? 'Período' : 'Semana / via') + '</th><th></th><th>Alterado</th><th></th></tr></thead><tbody>'
    + L.map(x => { const i = info(x); return '<tr><td><b>' + esc(x.nome || '(sem nome)') + '</b></td><td>' + i[0] + '</td><td class="hint">' + i[1] + '</td><td>' + piFmt((x.atualizado_em || '').slice(0, 10)) + '</td><td class="ac"><button data-pia="' + x.id + '">Abrir</button><button data-pic="' + x.id + '">Duplicar</button><button class="perigo" data-pid="' + x.id + '">Apagar</button></td></tr>' }).join('') + '</tbody></table>';
}

function piLiga(el, o, refaz) {
  el.querySelectorAll('[data-pin]').forEach(b => b.onclick = () => piEditor(o, null, b.dataset.pin, refaz));
  el.querySelectorAll('[data-pia]').forEach(b => b.onclick = () => { const r = PIS.find(x => x.id === b.dataset.pia); if (r) piEditor(o, r, r.tipo, refaz) });
  el.querySelectorAll('[data-pic]').forEach(b => b.onclick = async () => { const r = PIS.find(x => x.id === b.dataset.pic); if (!r) return;
    try { await ok(sb.from('pedidos_interdicao').insert({ obra_id: o.id, tipo: r.tipo, nome: (r.nome || '') + ' (cópia)', dados: JSON.parse(JSON.stringify(r.dados || {})) })); aviso('Cópia criada.'); refaz() } catch (e) { aviso(erroTxt(e), true) } });
  el.querySelectorAll('[data-pid]').forEach(b => b.onclick = async () => { const r = PIS.find(x => x.id === b.dataset.pid); if (!r) return;
    if (!await confirmar('Apagar «' + (r.nome || '') + '»? Esta ação não se pode desfazer.', 'Apagar')) return;
    try { await ok(sb.from('pedidos_interdicao').delete().eq('id', r.id)); aviso('Apagado.'); refaz() } catch (e) { aviso(erroTxt(e), true) } });
  const im = el.querySelector('[data-pimp]'); if (im) im.onclick = () => piImportaPTI(o, refaz);
  const pp = el.querySelector('[data-pdpti]'); if (pp) pp.onclick = () => piPedidosDoPTI(o, refaz);
  const pm = el.querySelector('[data-pmod]'); if (pm) pm.onclick = () => piModeloDlg(false);
  const pm2 = el.querySelector('[data-pmodp]'); if (pm2) pm2.onclick = () => piModeloDlg(true);
}

/* ---------- importar o Excel do PTI (folhas com «Data», «Hora Inicio», «Tipo Interdição»…) ---------- */
function piLeFolha(ws) {
  const rg0 = XLSX.utils.decode_range(ws['!ref'] || 'A1'), verde = (r, c) => { const x = ws[XLSX.utils.encode_cell({ r: r + rg0.s.r, c: c + rg0.s.c })]; const s = x && x.s; return !!(s && s.patternType === 'solid' && s.fgColor && (s.fgColor.theme === 9 || /^FF?E2EFDA$|^E2EFDA$|C6E0B4/i.test(s.fgColor.rgb || ''))) };
  const A = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
  const nrm = v => String(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  let hr = -1; for (let i = 0; i < Math.min(A.length, 15); i++) if (A[i].some(v => nrm(v) === 'hora inicio') && A[i].some(v => nrm(v) === 'data')) { hr = i; break }
  if (hr < 0) return null;
  const H = A[hr].map(nrm), col = t => H.findIndex(v => v === t || v.startsWith(t));
  const cD = col('data'), cHi = col('hora inicio'), cHf = col('hora fim'), cTp = col('tipo interd'), cV = col('via'), cEi = col('estacao inicio'), cEf = col('estacao fim');
  const cTr = H.findIndex(v => /trabalhos|obs/.test(v));
  const lim = c => { if (c < 0) return [-1, -1]; return H[c + 1] === '' ? [c + 1, c + 2] : [-1, c + 1] };
  const [cSi, cPi] = lim(cEi), [cSf, cPf] = lim(cEf);
  const data = v => { if (v === '' || v == null) return ''; if (typeof v === 'number') { const d = XLSX.SSF.parse_date_code(v); return d ? d.y + '-' + String(d.m).padStart(2, '0') + '-' + String(d.d).padStart(2, '0') : '' }
    const m = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/.exec(String(v)); if (m) return (m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); const n = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v)); return n ? n[0] : '' };
  const hora = v => { if (v === '' || v == null) return ''; if (typeof v === 'number') { const m = Math.round(v * 1440); return m >= 1440 && m < 1441 ? '24:00' : piHH(m % 1440) } const m = /(\d{1,2}):(\d{2})/.exec(String(v)); return m ? m[1].padStart(2, '0') + ':' + m[2] : String(v).trim() };
  const out = []; let d0 = '';
  for (let i = hr + 1; i < A.length; i++) { const r = A[i], g = c => c >= 0 ? String(r[c] ?? '').trim() : '';
    const d = data(r[cD]); if (d) d0 = d; const hi = hora(r[cHi]), hf = hora(r[cHf]); if (!hi && !hf) continue;
    out.push({ cor: verde(i, cTr >= 0 ? cTr : cHi) || undefined, d: d0, hi, hf, tp: g(cTp), via: g(cV).replace(/\s+/g, ''), ei: g(cEi), si: g(cSi), pi: g(cPi), ef: g(cEf), sf: g(cSf), pf: g(cPf), tr: g(cTr) }) }
  return out;
}
async function piImportaPTI(o, refaz) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx,.xlsm,.xls';
  inp.onchange = async () => { const f = inp.files[0]; if (!f) return;
    try { await carregaXlsx(); const wb = XLSX.read(new Uint8Array(await f.arrayBuffer()), { type: 'array', cellDates: false, cellStyles: true });
      const fol = wb.SheetNames.map(n => ({ n, r: piLeFolha(wb.Sheets[n]) })).filter(x => x.r && x.r.some(r => r.d));
      if (!fol.length) { aviso('Não encontrei nenhuma folha com o formato do PTI (Data, Hora Inicio, Hora Fim…).', true); return }
      const v = await formulario('Importar PTI', [{ tipo: 'aviso', texto: f.name + ': escolhe as folhas a importar. Cada folha fica um PTI.' }, { id: 'f', tipo: 'checks', rotulo: 'Folhas', opcoes: fol.map(x => ({ v: x.n, t: x.n + ' (' + x.r.length + ' períodos)' })), valor: fol.map(x => x.n) }], 'Importar');
      if (!v || !v.f.length) return; let k = 0;
      for (const x of fol.filter(x => v.f.includes(x.n))) { const t = f.name.replace(/\.[^.]+$/, '') + (fol.length > 1 ? ' · ' + x.n : '');
        await ok(sb.from('pedidos_interdicao').insert({ obra_id: o.id, tipo: 'pti', nome: t, dados: { rows: x.r, origem: f.name } })); k++ }
      aviso(k + ' PTI importado' + (k === 1 ? '' : 's') + '.'); refaz() } catch (e) { aviso(erroTxt(e), true) } };
  inp.click();
}

/* ---------- pedidos a partir de uma semana do PTI ---------- */
const piFrente = r => [r.ei, r.ef].filter(Boolean).join(' → ');
function piDoPTI(rows, sem, via, fr) {
  const R = piOrd(rows.filter(r => r.d && piSemana(r.d).s + '/' + piSemana(r.d).a === sem && (!via || r.via === via) && (!fr || piFrente(r) === fr)));
  const P = piVazioP(); if (!R.length) return P; const r0 = R[0], ws = piSemana(r0.d);
  P.sem = ws.s + '/' + ws.a; P.num = P.sem; P.via = /,/.test(r0.via) || /VA.*VD|VD.*VA/.test(r0.via) ? 'VA+VD' : (r0.via || 'VA');
  P.per = R.slice(0, 20).map(r => ({ d: r.d, hi: r.hi, hf: r.hf === '24:00' ? '24:00' : r.hf }));
  P.desc = [...new Set(R.map(r => r.tr).filter(Boolean))].join('; ');
  P.estI = [r0.ei, r0.si && '(' + r0.si + ')'].filter(Boolean).join(' '); P.estF = [r0.ef, r0.sf && '(' + r0.sf + ')'].filter(Boolean).join(' ');
  P.intEst = r0.ei || ''; P.ctEst = r0.ei || ''; P.sinI = r0.si ? r0.si + (r0.ei ? ' de ' + r0.ei : '') : ''; P.sinF = r0.sf ? r0.sf + (r0.ef ? ' de ' + r0.ef : '') : '';
  P.posI = r0.pi || ''; P.posF = r0.pf || ''; P.prog = { int: /I/.test(r0.tp), ct: /CT|CGT/.test(r0.tp), sca: false, outro: '' };
  return P;
}
async function piPedidosDoPTI(o, refaz) {
  const ptis = PIS.filter(x => x.tipo === 'pti'); if (!ptis.length) return;
  const v0 = await formulario('Pedidos a partir do PTI', [{ id: 'p', tipo: 'select', rotulo: 'PTI', opcoes: ptis.map(x => ({ v: x.id, t: x.nome || '(sem nome)' })), valor: ptis[0].id }], 'Seguinte'); if (!v0) return;
  const pt = ptis.find(x => x.id === v0.p), rows = (pt.dados || {}).rows || [];
  const g = new Map(); rows.filter(r => r.d).forEach(r => { const w = piSemana(r.d), k = w.s + '/' + w.a + '|' + r.via + '|' + piFrente(r); if (!g.has(k)) g.set(k, { sem: w.s + '/' + w.a, via: r.via, fr: piFrente(r), n: 0, d: r.d }); g.get(k).n++ });
  const ops = [...g.entries()].sort((a, b) => a[1].d.localeCompare(b[1].d)).map(([k, x]) => ({ v: k, t: 'Semana ' + x.sem + ' · ' + x.via + ' · ' + (x.fr || '—') + ' · ' + x.n + ' período' + (x.n === 1 ? '' : 's') }));
  const v = await formulario('Escolhe as semanas', [{ tipo: 'aviso', texto: 'Fica um pedido por semana, via e frente (estação de início → fim). Os períodos, as estações, os sinais e os postes limite vêm do PTI; completa o resto no editor.' }, { id: 's', tipo: 'checks', rotulo: 'Semanas do PTI', opcoes: ops, valor: [] }], 'Criar pedidos');
  if (!v || !v.s.length) return; let k = 0;
  try { for (const key of v.s) { const [sem, via, fr] = key.split('|'), d = piDoPTI(rows, sem, via, fr); d.origem = pt.nome;
      await ok(sb.from('pedidos_interdicao').insert({ obra_id: o.id, tipo: 'pedido', nome: 'Pedido ' + sem + ' ' + via + (fr ? ' · ' + fr : ''), dados: d })); k++ }
    aviso(k + ' pedido' + (k === 1 ? '' : 's') + ' criado' + (k === 1 ? '' : 's') + '.'); refaz() } catch (e) { aviso(erroTxt(e), true) }
}

/* ---------- modelo Excel da IP (fica na organização, não na app) ---------- */
async function piModeloDlg(pti) {
  const path = pti ? PI_MOD_PTI() : PI_MOD(), nm = path.split('/').pop(), w = janela(pti ? 'Modelo Excel do PTI' : 'Modelo Excel do pedido de interdição'); let tem = false;
  try { const r = await sb.storage.from('documentos').list(path.replace(/\/[^/]+$/, ''), { search: nm.replace('.xlsx', '') }); tem = (r.data || []).some(x => x.name === nm) } catch (e) { }
  const txt = pti ? (tem ? 'Já há um modelo carregado: o Excel do PTI é feito no teu ficheiro (cabeçalho, larguras, letra e impressão), com as linhas da app.' : 'Ainda não há modelo. Carrega o Excel do PTI que usas: a folha com «Hora Inicio» e «Trabalhos a Executar» serve de base.')
    : (tem ? 'Já há um modelo carregado. O Excel de cada pedido é feito a partir dele, na folha da via (VA, VD, VA+VD…), mantendo o formato da IP.' : 'Ainda não há modelo. Carrega o Excel «Pedido de Interdições» da IP: cada folha (VA+VD, VD, VA…) serve de base à via correspondente.');
  w.corpo.innerHTML = '<p>' + txt + '</p><p class="hint">Só o administrador pode substituir o modelo.</p><div class="bt"><button class="n">Fechar</button><button class="pri" id="pmUp">' + (tem ? 'Substituir modelo…' : 'Carregar modelo…') + '</button></div>';
  w.corpo.querySelector('.n').onclick = w.fecha;
  w.corpo.querySelector('#pmUp').onclick = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.xlsx,.xlsm'; i.onchange = async () => { const f = i.files[0]; if (!f) return;
    const r = await sb.storage.from('documentos').upload(path, f, { upsert: true, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    if (r.error) aviso(erroTxt(r.error), true); else { aviso('Modelo guardado.'); w.fecha() } }; i.click() };
}

/* ---------- pré-visualização (HTML para imprimir) ---------- */
const PI_CSS = '.piF{font:11px/1.3 Arial,Helvetica,sans-serif;color:#000;background:#fff}.piF table{border-collapse:collapse;width:100%}.piF td,.piF th{border:1px solid #000;padding:3px 5px;vertical-align:middle;height:15px}'
  + '.piF th{background:#e8e8e8;font-weight:700;color:#000;text-transform:none;letter-spacing:0;font-size:inherit;text-align:center}.piF .l{background:#f2f2f2;font-weight:700;white-space:nowrap}.piF .v{background:#fffbe0}.piF .bx{display:inline-block;width:11px;height:11px;border:1px solid #000;text-align:center;line-height:10px;font-size:10px;font-weight:700;margin:0 4px 0 8px;vertical-align:-2px}'
  + '.piF .sem td{border-top:2px solid #000}.piT{font-family:"Aptos Narrow","Arial Narrow",Arial,sans-serif}.piT th{background:none;border:0;border-bottom:1px solid #000;font-size:1.27em;padding:4px 3px;white-space:nowrap}.piT td{border:0;height:2.1em;padding:1px 3px;text-align:center;white-space:nowrap}.piT td.tW{white-space:pre-wrap}.piT td.tL{border-bottom:1px solid #000}.piT td.tI{border-top:1px solid #000}.piT td.tB{border-bottom:1px solid #000}.piT tr.tV td:not(.tS){background:#e2efda}.piT td{display:table-cell}.piF h1{font-size:13px;margin:0 0 6px;font-weight:700}.piF .nb td{border:0}.piF .c{text-align:center}.piF .mono{font-family:Consolas,monospace}';
const piBx = (on, t) => '<span class="bx">' + (on ? 'X' : '') + '</span>' + esc(t);
function piHtmlPTI(nome, rows) {
  const R = piOrd(rows), sk = r => r && r.d ? piSemana(r.d).s + '/' + piSemana(r.d).a : null;
  return '<div class="piF piT"><table><thead><tr>' + ['Semana', 'Data', 'Reg. Freq.', 'Hora Inicio', 'Hora Fim', 'Tipo Interdição', 'Via/Linha', 'Estação Inicio', '', 'Poste Limite', 'Estação Fim', '', 'Poste Limite', 'Trabalhos a Executar'].map(x => '<th>' + x + '</th>').join('') + '</tr></thead><tbody>'
    + R.map((r, i) => { const a = R[i - 1], b = R[i + 1], iniD = !a || a.d !== r.d, fimD = !b || b.d !== r.d, iniS = sk(r) !== sk(a), fimS = sk(r) !== sk(b), w = r.d ? piSemana(r.d) : null;
      const cd = 'tD' + (iniD ? ' tI' : '') + (fimD ? ' tB' : '');
      return '<tr' + (r.cor ? ' class="tV"' : '') + '><td class="tS' + (fimS ? ' tB' : '') + '">' + ((iniS || fimS) && w ? w.s : '') + '</td><td class="' + cd + '">' + (iniD ? piFmt(r.d) : '') + '</td><td class="' + cd + '">' + (iniD && r.d ? piReg(r.d) : '') + '</td>'
        + [r.hi, r.hf, r.tp, r.via, r.ei, r.si, r.pi, r.ef, r.sf, r.pf, r.tr].map((v, k) => '<td class="tL' + (k >= 9 ? ' tW' : '') + '">' + esc(v || '') + '</td>').join('') + '</tr>' }).join('')
    + '</tbody></table></div>';
}
function piHtmlPedido(P) {
  const v = x => '<td class="v">' + esc(x == null ? '' : x) + '</td>', ext = (+String(P.pkF).replace(',', '.') - +String(P.pkI).replace(',', '.'));
  const dias = new Set((P.per || []).filter(p => p.d).map(p => piD(p.d).getDay())), per = (P.per || []).slice(0, 20);
  const linhaP = i => { const a = per[i] || {}, b = per[i + 10] || {}; return '<tr>' + v(piFmt(a.d)) + v(a.hi) + v(a.hf) + '<td class="c">' + piDur(a.hi, a.hf) + '</td>' + v(piFmt(b.d)) + v(b.hi) + v(b.hf) + '<td class="c">' + piDur(b.hi, b.hf) + '</td></tr>' };
  const viaA = /VA/.test(P.via), viaD = /VD/.test(P.via) || P.via === 'VU';
  return '<div class="piF"><h1>Pedido de Interdição / Corte de Tensão / Redução de Velocidade</h1><table>'
    + '<tr><td class="l">Linha de</td>' + v(P.linha) + '<td class="l">Semana / Ano</td>' + v(P.sem) + '<td class="l">Pedido Nº</td>' + v(P.num) + '</tr>'
    + '<tr><td class="l" colspan="6">Descrição do pedido</td></tr><tr><td class="v" colspan="6" style="height:44px;white-space:pre-wrap">' + esc(P.desc) + '</td></tr>'
    + '<tr><td class="l">Via</td>' + v(P.via) + '<td class="l">e Linha</td>' + v(P.viaLinha) + '<td class="l">OS recebida</td>' + v(P.os) + '</tr>'
    + '<tr><td class="l">Pk dos trabalhos (km)</td>' + v('Início ' + (P.pkI || '')) + v('Fim ' + (P.pkF || '')) + '<td class="l">Extensão (m)</td><td class="c" colspan="2">' + (isFinite(ext) && P.pkI && P.pkF ? Math.round(Math.abs(ext) * 1000) : '') + '</td></tr>'
    + '<tr><td class="l">Tipo de período</td><td colspan="5">' + piBx(P.periodo === 'azul', 'Azul') + piBx(P.periodo === 'normal', 'Normal') + piBx(P.periodo === 'grande', 'Grande') + piBx(P.periodo === 'fora', 'Fora de prazo') + (P.just ? ' — ' + esc(P.just) : '') + '</td></tr>'
    + '<tr><td class="l">Tipo de programação</td><td colspan="5">' + piBx(P.prog.int, 'Interdição') + piBx(P.prog.ct, 'Corte tens.') + piBx(P.prog.sca, 'Susp. CA') + piBx(!!P.prog.outro, 'Outro' + (P.prog.outro ? ': ' + P.prog.outro : '')) + piBx(P.rv, 'Redução velocidade') + '</td></tr>'
    + '<tr><td class="l">Estação inicial</td>' + v(P.estI) + '<td class="l">Estação final</td><td class="v" colspan="3">' + esc(P.estF) + '</td></tr>'
    + '<tr><td class="l">Pk das diagonais limites</td>' + v('Início ' + (P.diagI || '')) + v('Fim ' + (P.diagF || '')) + '<td class="l">Elemento PEP</td><td class="v" colspan="2">' + esc(P.pep) + '</td></tr>'
    + '<tr><td class="l">Dias</td><td colspan="5">' + [1, 2, 3, 4, 5, 6, 0].map(i => piBx(dias.has(i), PI_DOW[i])).join('') + '</td></tr></table>'
    + '<table style="margin-top:-1px"><tr><th>Data</th><th>Hora início</th><th>Hora fim</th><th>Dur</th><th>Data</th><th>Hora início</th><th>Hora fim</th><th>Dur</th></tr>' + Array.from({ length: 10 }, (_, i) => linhaP(i)).join('') + '</table>'
    + '<table style="margin-top:-1px"><tr><td class="l">Interdição</td><td colspan="3">' + piBx(viaA, 'Via ascendente') + piBx(viaD, 'Via descendente') + piBx(P.intLinha, 'Linha') + ' da estação de <b>' + esc(P.intEst) + '</b></td></tr>'
    + '<tr><td class="l">Estação inicial · sinal limite</td><td class="v" colspan="3">' + esc(P.sinI) + '</td></tr><tr><td class="l">Estação final · sinal limite</td><td class="v" colspan="3">' + esc(P.sinF) + '</td></tr>'
    + '<tr><td class="l">Corte de tensão</td><td colspan="3">' + piBx(P.prog.ct && viaA, 'Via ascendente') + piBx(P.prog.ct && viaD, 'Via descendente') + piBx(P.ctLinha, 'Linha') + ' da estação de <b>' + esc(P.ctEst) + '</b></td></tr>'
    + '<tr><td class="l">Estação inicial · poste limite</td><td class="v" colspan="3">' + esc(P.posI) + '</td></tr><tr><td class="l">Estação final · poste limite</td><td class="v" colspan="3">' + esc(P.posF) + '</td></tr>'
    + '<tr><td class="l">Secções elementares a desligar</td><td class="v" colspan="3" style="white-space:pre-wrap">' + esc(P.se) + '</td></tr>'
    + '<tr><td class="l">Meios ferroviários a utilizar</td><td class="v" colspan="3" style="white-space:pre-wrap">' + esc(P.meios) + '</td></tr>'
    + '<tr><td class="l">Entram e saem na estação de</td><td class="v" colspan="3" style="white-space:pre-wrap">' + esc(P.meiosES) + '</td></tr>'
    + '<tr><th colspan="2">Chefe dos trabalhos</th><th colspan="2">Cargo / entidade executante</th></tr>' + (P.chefe || []).map(c => '<tr><td class="v" colspan="2">' + esc(c.n) + '</td><td class="v" colspan="2">' + esc(c.c) + '</td></tr>').join('')
    + '<tr><td class="l">Folha anexa</td><td colspan="3">' + piBx(P.anexa, 'Sim') + '</td></tr>'
    + '<tr><td class="l">Observações</td><td class="v" colspan="3" style="white-space:pre-wrap">' + esc(P.obs) + '</td></tr>'
    + '<tr><td class="l">Ent. executante</td>' + v(P.ent) + '<td class="l">Data</td>' + v(piFmt(P.data)) + '</tr></table>'
    + '<p style="font-size:9.5px;margin:6px 0 0">Nota: pedidos de apoio pela IP, SA (guarnecimento de PN, Convel, etc.) devem ser feitos por comunicação própria.</p></div>';
}
function piImprime(html, paisagem, titulo) {
  const w = window.open('', '_blank'); if (!w) { aviso('O navegador bloqueou a janela de impressão.', true); return }
  w.document.write('<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>' + esc(titulo) + '</title><style>@page{size:A4 ' + (paisagem ? 'landscape' : 'portrait') + ';margin:8mm}body{margin:0}' + PI_CSS + '.piF{font-size:' + (paisagem ? '9.5px' : '11px') + '}</style></head><body>' + html + '<script>setTimeout(()=>print(),300)<\/script></body></html>'); w.document.close();
}

/* ---------- Excel ---------- */
/* PTI no formato do modelo da IP usado na obra: só linhas horizontais; data e Reg. Freq. na 1.ª linha do dia
   (traço em cima e no fim do dia); semana na 1.ª e na última linha da semana; linhas em destaque a verde claro. */
async function piExcelPTI(nome, rows) {
  await carregaExcelJS(); let wb = new ExcelJS.Workbook(), ws = null;
  const m = await sb.storage.from('documentos').download(PI_MOD_PTI());
  if (!m.error) { try { await wb.xlsx.load(await m.data.arrayBuffer()); const nr = v => String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      ws = wb.worksheets.find(w => /hora inicio/.test(nr(w.getCell('E1').value)) && /trabalhos/.test(nr(w.getCell('O1').value))) || wb.worksheets.find(w => /hora inicio/.test(nr(w.getCell('E1').value))) || null } catch (e) { ws = null } }
  /* livro novo (o modelo traz linhas ocultas e fórmulas antigas); do modelo copiam-se o cabeçalho, as larguras e a impressão */
  const mod = ws, nw = new ExcelJS.Workbook(), out = nw.addWorksheet('PTI', { views: [{ state: 'frozen', ySplit: 1, showGridLines: mod ? mod.views && mod.views[0] && mod.views[0].showGridLines !== false : true }] });
  const W0 = [1.1, 15.9, 13, 9, 10, 10, 17.3, 15.9, 13, 15.9, 15.9, 13, 15.9, 38.1, 9];
  for (let k = 1; k <= 15; k++) out.getColumn(k).width = mod && mod.getColumn(k).width ? mod.getColumn(k).width : W0[k - 1];
  const cab = ['', 'Semana', 'Data', 'Reg. Freq.', 'Hora Inicio', 'Hora Fim', 'Tipo Interdição', 'Via/Linha', 'Estação Inicio', '', 'Poste Limite', 'Estação Fim', '', 'Poste Limite', 'Trabalhos a Executar'];
  const h = out.getRow(1); h.height = mod && mod.getRow(1).height ? mod.getRow(1).height : 30;
  cab.forEach((t, k) => { const c = h.getCell(k + 1), m0 = mod ? mod.getRow(1).getCell(k + 1) : null; c.value = m0 && m0.value != null ? m0.value : (t || null);
    if (k) { c.font = m0 && m0.font && m0.font.size ? Object.assign({}, m0.font) : { name: 'Aptos Narrow', size: 14, bold: true }; c.alignment = { horizontal: 'center', vertical: 'middle' }; c.border = { bottom: { style: 'thin' } } } });
  const ps = mod ? Object.assign({}, mod.pageSetup) : {}; out.pageSetup = Object.assign({ orientation: 'landscape', paperSize: 9, horizontalCentered: true, margins: { left: .24, right: .24, top: .75, bottom: .75, header: .3, footer: .3 } }, { orientation: ps.orientation || 'landscape', paperSize: ps.paperSize || 9, margins: ps.margins || { left: .24, right: .24, top: .75, bottom: .75, header: .3, footer: .3 }, horizontalCentered: true }, { fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:1' });
  wb = nw; ws = out;
  const R = piOrd(rows), F = { name: 'Aptos Narrow', size: 11 }, T = { style: 'thin' }, verde = { type: 'pattern', pattern: 'solid', fgColor: { theme: 9, tint: 0.7999816888943144 } };
  const t = h => { const m = piMin(h); return m == null ? (h || null) : (String(h).trim() === '24:00' ? 1 : m / 1440) };
  R.forEach((r, i) => { const n = i + 2, w = r.d ? piSemana(r.d) : null, sk = w ? w.s + '/' + w.a : '', ant = R[i - 1], seg = R[i + 1];
    const skA = ant && ant.d ? piSemana(ant.d).s + '/' + piSemana(ant.d).a : null, skS = seg && seg.d ? piSemana(seg.d).s + '/' + piSemana(seg.d).a : null;
    const iniD = !ant || ant.d !== r.d, fimD = !seg || seg.d !== r.d, iniS = sk !== skA, fimS = sk !== skS;
    const row = ws.getRow(n); row.height = 25.15;
    const val = [null, (iniS || fimS) && w ? w.s : null, iniD && r.d ? new Date(Date.UTC(+r.d.slice(0, 4), +r.d.slice(5, 7) - 1, +r.d.slice(8, 10))) : null, iniD && r.d ? piReg(r.d) : null, t(r.hi), t(r.hf), r.tp || null, r.via || null, r.ei || null, r.si || null, r.pi || null, r.ef || null, r.sf || null, r.pf || null, r.tr || null];
    val.forEach((v, k) => { if (!k) return; const c = row.getCell(k + 1); c.value = v; c.font = F; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: k >= 13 };
      c.border = k === 1 ? (fimS ? { bottom: T } : {}) : k <= 3 ? Object.assign({}, iniD ? { top: T } : {}, fimD ? { bottom: T } : {}) : { bottom: T };
      if (k === 2) c.numFmt = 'dd/mm/yyyy'; if (k === 4) c.numFmt = 'h:mm'; if (k === 5) c.numFmt = '[h]:mm';
      if (r.cor && k >= 2) c.fill = verde });
    row.commit && row.commit() });
  pdtDescarrega((nome || 'PTI').replace(/[\\/:*?"<>|]+/g, ' ') + '.xlsx', new Blob([await wb.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
}
async function piExcelPedido(nome, P) {
  const r = await sb.storage.from('documentos').download(PI_MOD());
  if (r.error) { aviso('Ainda não há modelo Excel da IP: em «Pedidos de interdição», «Modelo Excel da IP…».', true); return }
  await carregaExcelJS(); const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await r.data.arrayBuffer());
  const nm = s => s.toUpperCase().replace(/\s+/g, ''), via = nm(P.via === 'VA,VD' ? 'VA+VD' : P.via || 'VA');
  const ws = wb.worksheets.find(w => nm(w.name) === via) || wb.worksheets.find(w => nm(w.name).startsWith(via + '(') && !/FDS|5\.3|ZN|SEC/.test(w.name)) || wb.worksheets.find(w => nm(w.name).startsWith(via)) || wb.worksheets[0];
  wb.worksheets.filter(w => w !== ws).forEach(w => wb.removeWorksheet(w.id)); ws.name = 'Pedido';
  const put = (a, val) => { ws.getCell(a).value = val === '' || val == null ? null : val };
  const num = s => { const x = +String(s || '').replace(',', '.'); return s !== '' && isFinite(x) ? x : (s || null) };
  put('C1', P.linha); put('H1', P.sem); put('N1', P.num);
  const dl = String(P.desc || '').split('\n'); put('A3', dl[0] || ''); put('A4', dl.slice(1, 2).join(' ')); put('A5', dl.slice(2, 3).join(' ')); put('A6', dl.slice(3).join(' '));
  put('B8', P.via === 'VA,VD' ? 'VA+VD' : P.via); put('J8', P.viaLinha); put('F9', num(P.pkI)); put('J9', num(P.pkF));
  [['azul', 'D11'], ['normal', 'F11'], ['grande', 'H11'], ['fora', 'J11']].forEach(([k, a]) => put(a, P.periodo === k ? 'x' : ''));
  put('D13', P.prog.int ? 'x' : ''); put('F13', P.prog.ct ? 'x' : ''); put('H13', P.prog.sca ? 'x' : ''); put('J13', P.prog.outro ? 'x' : ''); put('B15', P.rv ? 'x' : '');
  put('C18', P.estI); put('J18', P.estF); put('F19', num(P.diagI)); put('J19', num(P.diagF)); put('C22', P.pep);
  const dias = new Set((P.per || []).filter(p => p.d).map(p => piD(p.d).getDay()));
  [[1, 'B21'], [2, 'D21'], [3, 'F21'], [4, 'H21'], [5, 'J21'], [6, 'L21'], [0, 'N21']].forEach(([d, a]) => put(a, dias.has(d) ? 'X' : ''));
  const t = h => { const m = piMin(h); return m == null ? null : m / 1440 };
  for (let i = 0; i < 20; i++) { const p = (P.per || [])[i] || {}, row = 24 + (i % 10), c = i < 10 ? ['A', 'B', 'D'] : ['H', 'J', 'L'];
    put(c[0] + row, p.d ? new Date(Date.UTC(+p.d.slice(0, 4), +p.d.slice(5, 7) - 1, +p.d.slice(8, 10))) : null); put(c[1] + row, t(p.hi)); put(c[2] + row, p.hf === '24:00' ? 1 : t(p.hf)) }
  put('D37', P.intLinha ? 'x' : ''); put('J37', P.intEst); put('F39', P.sinI); put('F40', P.sinF); put('D44', P.ctLinha ? 'x' : ''); put('J44', P.ctEst);
  put('F46', P.posI); put('F47', P.posF); put('H48', P.se); put('F49', P.meios); put('F50', P.meiosES);
  (P.chefe || []).slice(0, 2).forEach((c, i) => { put('A' + (52 + i), c.n); put('O' + (52 + i), c.c) });
  put('N55', P.anexa ? 'x' : ''); put('C57', P.obs); put('C61', P.ent); put('F61', P.data ? new Date(Date.UTC(+P.data.slice(0, 4), +P.data.slice(5, 7) - 1, +P.data.slice(8, 10))) : null);
  try { wb.definedNames.model = [] } catch (e) { } /* nomes do modelo apontam para folhas que saíram (o Excel pediria para reparar) */
  ws.pageSetup.printArea = 'A$1:O$61'; /* o ExcelJS acrescenta o $ da coluna */
  pdtDescarrega((nome || 'Pedido de interdição').replace(/[\\/:*?"<>|]+/g, ' ') + '.xlsx', new Blob([await wb.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
}

/* ---------- editor (formulário à esquerda; pré-visualização e esquemas à direita) ---------- */
function piEditor(o, rec, tipo, refaz) {
  const pti = tipo === 'pti';
  let D = rec ? JSON.parse(JSON.stringify(rec.dados || {})) : (pti ? { rows: [] } : piVazioP());
  if (!pti) D = Object.assign(piVazioP(), D, { prog: Object.assign(piVazioP().prog, D.prog || {}) });
  let nome = rec ? rec.nome || '' : (pti ? 'PTI ' + o.nome : 'Pedido de interdição'), sujo = false, id = rec ? rec.id : null;
  const ov = document.createElement('div'); ov.id = 'piEd'; ov.style.cssText = 'position:fixed;inset:0;z-index:40;background:var(--paper);display:flex;flex-direction:column'; document.body.appendChild(ov);
  const sec = (t, c, a) => '<details class="pdS"' + (a !== false ? ' open' : '') + '><summary>' + t + '</summary><div class="pdB">' + c + '</div></details>';
  const css = '<style>#piEd .pdS{border:1px solid var(--rule);border-radius:8px;background:var(--sheet);margin:0 0 10px}#piEd summary{cursor:pointer;padding:9px 12px;font-weight:600;font-size:13.5px}#piEd .pdB{padding:4px 12px 12px}#piEd label{font-size:12px;color:var(--muted);display:block;margin:8px 0 3px}'
    + '#piEd .tb{display:flex;gap:8px;align-items:center;padding:8px 14px;border-bottom:1px solid var(--rule);background:var(--sheet);flex-wrap:wrap}#piEd .sp{flex:1}#piEd .cs{display:grid;grid-template-columns:minmax(420px,' + (pti ? '58%' : '46%') + ') 1fr;flex:1;min-height:0}#piEd .cf{overflow:auto;padding:12px 14px}#piEd .cw{display:flex;flex-direction:column;min-height:0;min-width:0}'
    + '#piEd .cp{overflow:auto;background:#6b6f76;flex:1;min-height:0}#piEd .piPg{background:#fff;margin:14px auto;padding:10mm;box-shadow:0 2px 10px rgba(0,0,0,.35);' + (pti ? 'width:max-content;min-width:calc(100% - 28px);margin:14px' : 'width:190mm;max-width:calc(100% - 28px)') + ';box-sizing:border-box}' + PI_CSS
    + '#piEd .g2{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}#piEd .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 10px}#piEd .piPg .piF{font-size:' + (pti ? '10px' : '11px') + '}#piEd .chk{display:inline-flex;gap:5px;align-items:center;margin:4px 12px 4px 0;color:var(--ink);font-size:13px}'
    + '#piEd .piGrd{overflow-x:auto}#piEd .piGrd table{border-collapse:collapse}#piEd .piGrd th{font-size:11px;color:var(--muted);text-align:left;padding:2px 3px;font-weight:600;white-space:nowrap}#piEd .piGrd td{padding:1px 2px}#piEd .piGrd input,#piEd .piGrd select{padding:4px 5px;font-size:12.5px;min-width:0;width:100%;box-sizing:border-box}'
    + '#piEd .piGrd tr.sem td{border-top:2px solid var(--rule)}#piEd .piGrd .ix{font-size:11px;color:var(--muted);white-space:nowrap;padding-right:4px}@media(max-width:900px){#piEd .cs{grid-template-columns:1fr}}</style>';
  const inp = (k, rot, ph, tp) => '<div><label>' + rot + '</label><input data-k="' + k + '" value="' + esc(D[k] ?? '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + (tp ? ' type="' + tp + '"' : '') + '></div>';
  const txa = (k, rot, n) => '<div><label>' + rot + '</label><textarea data-k="' + k + '" rows="' + (n || 2) + '">' + esc(D[k] ?? '') + '</textarea></div>';
  let form;
  if (pti) form = sec('Identificação', '<label>Nome do PTI</label><input id="piNome" value="' + esc(nome) + '"><p class="hint">Pedido trimestral de interdições: os períodos que a Somafel prevê pedir. Cada semana dá depois um pedido de interdição, e os pedidos dão origem às OS.</p>')
    + sec('Gerar períodos', '<div class="g3"><div><label>Semana(s)</label><input id="gSem" placeholder="47 ou 47-49 ou 47, 49"></div><div><label>Ano</label><input id="gAno" value="' + piSemana(piIso(new Date())).a + '"></div><div><label>&nbsp;</label><span class="hint" id="gSemTx"></span></div></div>'
      + '<label>Dias da semana</label><div>' + [1, 2, 3, 4, 5, 6, 0].map(i => '<label class="chk"><input type="checkbox" data-gd="' + i + '"> ' + PI_DOW[i] + '</label>').join('') + '</div>'
      + '<label>Linhas a pôr em cada dia marcado (podes ter várias no mesmo dia: outra via, outra frente, outro horário)</label><div class="piGrd" id="gGr"></div>'
      + '<div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap"><button id="gAdd">+ Linha</button><button id="gDia" title="Copia todas as linhas de um dia da tabela para aqui">Copiar as linhas de um dia…</button></div>'
      + '<p class="hint">Se a hora de início for maior do que a de fim (ex.: 23:10 às 05:00), a app faz como no PTI da IP: 23:10–24:00 nesse dia e 00:00–05:00 no dia seguinte.</p><div style="margin-top:8px"><button class="pri" id="gOk">Acrescentar ao PTI</button></div>', !(D.rows || []).length)
    + sec('Períodos', '<div class="piGrd" id="piGr"></div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button id="piAdd">+ Linha</button><button id="piOrd">Ordenar por data</button><span class="hint" id="piCont"></span></div>');
  else form = sec('Identificação', '<label>Nome (na lista)</label><input id="piNome" value="' + esc(nome) + '"><div class="g3">' + inp('linha', 'Linha de') + inp('sem', 'Semana / ano', '47/2026') + inp('num', 'Pedido nº', '47/2026') + '</div>' + txa('desc', 'Descrição do pedido', 3) + '<div class="g3"><div><label>Via</label><select data-k="via">' + ['VA', 'VD', 'VA+VD', 'VU'].map(v => '<option' + (D.via === v ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></div>' + inp('viaLinha', 'e linha') + inp('os', 'OS recebida nº', 'quando chegar') + '</div>'
    + '<div class="g3">' + inp('pkI', 'Pk início (km)', '199.229') + inp('pkF', 'Pk fim (km)', '204.210') + '<div><label>Extensão</label><input id="piExt" disabled></div></div>')
    + sec('Tipo', '<label>Tipo de período</label><div>' + [['azul', 'Azul'], ['normal', 'Normal'], ['grande', 'Grande'], ['fora', 'Fora de prazo']].map(([k, t]) => '<label class="chk"><input type="radio" name="piPer" value="' + k + '"' + (D.periodo === k ? ' checked' : '') + '> ' + t + '</label>').join('') + '</div>' + inp('just', 'Justificação (fora de prazo)')
      + '<label>Tipo de programação</label><div><label class="chk"><input type="checkbox" data-pg="int"' + (D.prog.int ? ' checked' : '') + '> Interdição</label><label class="chk"><input type="checkbox" data-pg="ct"' + (D.prog.ct ? ' checked' : '') + '> Corte de tensão</label><label class="chk"><input type="checkbox" data-pg="sca"' + (D.prog.sca ? ' checked' : '') + '> Suspensão CA</label><label class="chk"><input type="checkbox" data-k="rv"' + (D.rv ? ' checked' : '') + '> Redução de velocidade</label></div><div><label>Outro</label><input data-pg="outro" value="' + esc(D.prog.outro || '') + '"></div>')
    + sec('Estações e períodos', '<div class="g2">' + inp('estI', 'Estação inicial', 'Alfarelos (SC2) e (S2)') + inp('estF', 'Estação final', 'Ameal-Sul (S1) e (SC1)') + inp('diagI', 'Pk diagonal limite início') + inp('diagF', 'Pk diagonal limite fim') + '</div>' + inp('pep', 'Elemento PEP')
      + '<label>Períodos (até 20) · os dias da semana marcam-se sozinhos</label><div class="piGrd" id="piGr"></div><div style="display:flex;gap:8px;margin-top:6px"><button id="piAdd">+ Período</button><button id="piPti"' + (PIS.some(x => x.tipo === 'pti') ? '' : ' disabled') + '>Trazer do PTI…</button></div>')
    + sec('Interdição', '<div><label class="chk"><input type="checkbox" data-k="intLinha"' + (D.intLinha ? ' checked' : '') + '> Linha</label></div>' + inp('intEst', 'da estação de') + '<div class="g2">' + inp('sinI', 'Estação inicial · sinal limite dos trabalhos', 'SC2 e S2 de Alfarelos') + inp('sinF', 'Estação final · sinal limite dos trabalhos', 'SC1 e S1 de Ameal-Sul') + '</div><p class="hint">As vias assinaladas (ascendente/descendente) seguem o campo «Via».</p>')
    + sec('Corte de tensão', '<div><label class="chk"><input type="checkbox" data-k="ctLinha"' + (D.ctLinha ? ' checked' : '') + '> Linha</label></div>' + inp('ctEst', 'da estação de') + '<div class="g2">' + inp('posI', 'Estação inicial · poste limite', '199-27d (prot.199-29)') + inp('posF', 'Estação final · poste limite', '204-13 (prot.204-11)') + '</div>' + txa('se', 'Secções elementares na zona de trabalho a desligar', 2))
    + sec('Meios e responsáveis', txa('meios', 'Meios ferroviários a utilizar', 2) + txa('meiosES', 'Que entram e saem na estação de', 2) + '<label>Chefe dos trabalhos (indicar turnos para períodos superiores a 8 h)</label>' + [0, 1].map(i => '<div class="g2"><input data-ch="' + i + '" data-f="n" placeholder="Nome - tlm" value="' + esc((D.chefe[i] || {}).n || '') + '"><input data-ch="' + i + '" data-f="c" placeholder="Cargo, entidade" value="' + esc((D.chefe[i] || {}).c || '') + '"></div>').join('<div style="height:5px"></div>')
      + '<div><label class="chk"><input type="checkbox" data-k="anexa"' + (D.anexa ? ' checked' : '') + '> Folha anexa</label></div>' + txa('obs', 'Observações', 2) + '<div class="g2">' + inp('ent', 'Entidade executante') + inp('data', 'Data', '', 'date') + '</div>');
  ov.innerHTML = css + '<div class="tb"><b>' + (pti ? 'PTI' : 'Pedido de interdição') + '</b><span id="piSt" class="hint"></span><span class="sp"></span><span style="display:inline-flex;gap:4px"><button class="sm pri" data-tab="prev">' + (pti ? 'PTI' : 'Pedido') + '</button><button class="sm" data-tab="sin">Sinalização</button><button class="sm" data-tab="ele">Elétrico</button></span>'
    + '<button id="piPrint">Imprimir / PDF</button><button id="piXls">Excel</button><button class="pri" id="piOk">Guardar</button><button id="piX">Fechar</button></div>'
    + '<div class="cs"><div class="cf">' + form + '</div><div class="cw"><div class="cp" id="piP"><div class="piPg" id="piPg"></div></div><div class="cp" id="piV" style="display:none;flex-direction:column"></div></div></div>';
  const $o = s => ov.querySelector(s), st = t => { $o('#piSt').textContent = t };
  const prev = () => { $o('#piPg').innerHTML = pti ? piHtmlPTI(nome, D.rows || []) : piHtmlPedido(D); if (!pti) { const e = +String(D.pkF).replace(',', '.') - +String(D.pkI).replace(',', '.'); $o('#piExt').value = D.pkI && D.pkF && isFinite(e) ? Math.round(Math.abs(e) * 1000) + ' m' : '' } };
  const mexe = () => { sujo = true; st('alterações por guardar'); clearTimeout(mexe.t); mexe.t = setTimeout(prev, 250) };
  /* tabela de períodos */
  function grelha() {
    const el = $o('#piGr');
    if (pti) { const R = D.rows; let s0 = null;
      el.innerHTML = '<table><thead><tr><th></th>' + PI_COLS.map(c => '<th>' + c[1] + '</th>').join('') + '<th title="Linha em destaque (verde claro, como no PTI)">Verde</th><th></th></tr></thead><tbody>' + R.map((r, i) => { const w = r.d ? piSemana(r.d) : null, sk = w ? w.s : '', ns = sk !== s0; s0 = sk;
        return '<tr' + (ns && i ? ' class="sem"' : '') + '><td class="ix">' + (r.d ? 'S' + w.s + ' ' + PI_DOW[piD(r.d).getDay()] : '') + '</td>' + PI_COLS.map(c => '<td style="min-width:' + c[2] + 'px">' + (c[3] === 'tp' || c[3] === 'via' ? '<select data-r="' + i + '" data-c="' + c[0] + '">' + [''].concat(c[3] === 'tp' ? PI_TIPOS : PI_VIAS).concat((c[3] === 'tp' ? PI_TIPOS : PI_VIAS).includes(r[c[0]]) || !r[c[0]] ? [] : [r[c[0]]]).map(v => '<option' + (v === (r[c[0]] || '') ? ' selected' : '') + '>' + esc(v) + '</option>').join('') + '</select>'
          : '<input data-r="' + i + '" data-c="' + c[0] + '"' + (c[3] === 'date' ? ' type="date"' : '') + ' value="' + esc(r[c[0]] || '') + '">') + '</td>').join('') + '<td style="text-align:center"><input type="checkbox" data-cor="' + i + '"' + (r.cor ? ' checked' : '') + '></td><td style="white-space:nowrap"><button class="sm" data-dup="' + i + '" title="Duplicar">⧉</button><button class="sm" data-del="' + i + '" title="Tirar">✕</button></td></tr>' }).join('') + '</tbody></table>';
      $o('#piCont').textContent = R.length + ' período' + (R.length === 1 ? '' : 's') + (R.length ? ' · ' + new Set(R.filter(r => r.d).map(r => { const w = piSemana(r.d); return w.s + '/' + w.a })).size + ' semanas' : '');
    } else { const R = D.per;
      el.innerHTML = '<table><thead><tr><th>Data</th><th>Hora início</th><th>Hora fim</th><th>Duração</th><th></th></tr></thead><tbody>' + R.map((p, i) => '<tr><td><input type="date" data-r="' + i + '" data-c="d" value="' + esc(p.d || '') + '"></td><td><input data-r="' + i + '" data-c="hi" value="' + esc(p.hi || '') + '" placeholder="00:00"></td><td><input data-r="' + i + '" data-c="hf" value="' + esc(p.hf || '') + '" placeholder="05:30"></td><td class="ix">' + piDur(p.hi, p.hf) + (p.d ? ' · ' + PI_DOW[piD(p.d).getDay()] : '') + '</td><td><button class="sm" data-del="' + i + '">✕</button></td></tr>').join('') + '</tbody></table>';
      $o('#piAdd').disabled = R.length >= 20 }
    el.querySelectorAll('[data-r]').forEach(x => x.onchange = () => { (pti ? D.rows : D.per)[+x.dataset.r][x.dataset.c] = x.value.trim(); mexe(); if (x.dataset.c === 'd') grelha() });
    el.querySelectorAll('[data-cor]').forEach(x => x.onchange = () => { D.rows[+x.dataset.cor].cor = x.checked; mexe() });
    el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { (pti ? D.rows : D.per).splice(+b.dataset.del, 1); grelha(); mexe() });
    el.querySelectorAll('[data-dup]').forEach(b => b.onclick = () => { const i = +b.dataset.dup; D.rows.splice(i + 1, 0, Object.assign({}, D.rows[i])); grelha(); mexe() });
  }
  grelha(); prev();
  $o('#piAdd').onclick = () => { if (pti) { const u = D.rows[D.rows.length - 1]; D.rows.push(u ? Object.assign({}, u) : { d: '', hi: '00:00', hf: '05:30', tp: 'I/CT', via: 'VA', ei: '', si: '', pi: '', ef: '', sf: '', pf: '', tr: '' }) } else if (D.per.length < 20) { const u = D.per[D.per.length - 1]; let d = ''; if (u && u.d) { const x = piD(u.d); x.setDate(x.getDate() + 1); d = piIso(x) } D.per.push({ d, hi: u ? u.hi : '00:00', hf: u ? u.hf : '05:30' }) } grelha(); mexe() };
  if (pti) {
    $o('#piOrd').onclick = () => { D.rows = piOrd(D.rows); grelha(); mexe() };
    /* gerador: semana(s) + dias + várias linhas-tipo por dia */
    const GL = [{ hi: '00:00', hf: '05:30', tp: 'I/CT', via: 'VA', ei: '', si: '', pi: '', ef: '', sf: '', pf: '', tr: '' }];
    const semanas = () => { const a = +$o('#gAno').value || piSemana(piIso(new Date())).a, out = []; String($o('#gSem').value || '').split(/[,;\s]+/).filter(Boolean).forEach(t => { const m = /^(\d{1,2})(?:-(\d{1,2}))?$/.exec(t); if (!m) return; for (let w = +m[1]; w <= +(m[2] || m[1]); w++) if (w >= 1 && w <= 53) out.push(w) }); return { a, ws: [...new Set(out)] } };
    const segunda = (w, a) => { const j4 = new Date(a, 0, 4, 12), d = new Date(j4); d.setDate(j4.getDate() - ((j4.getDay() + 6) % 7) + (w - 1) * 7); return d };
    const semTx = () => { const { a, ws } = semanas(); $o('#gSemTx').textContent = ws.length ? ws.map(w => { const s = segunda(w, a), f = new Date(s); f.setDate(s.getDate() + 6); return 'S' + w + ': ' + piFmt(piIso(s)).slice(0, 5) + '–' + piFmt(piIso(f)) }).join(' · ') : '' };
    $o('#gSem').oninput = semTx; $o('#gAno').oninput = semTx;
    const gcols = PI_COLS.filter(c => c[0] !== 'd');
    function gDesenha() { const el = $o('#gGr');
      el.innerHTML = '<table><thead><tr>' + gcols.map(c => '<th>' + c[1] + '</th>').join('') + '<th></th></tr></thead><tbody>' + GL.map((r, i) => '<tr>' + gcols.map(c => '<td style="min-width:' + c[2] + 'px">' + (c[3] === 'tp' || c[3] === 'via' ? '<select data-gr="' + i + '" data-c="' + c[0] + '">' + (c[3] === 'tp' ? PI_TIPOS : PI_VIAS).concat((c[3] === 'tp' ? PI_TIPOS : PI_VIAS).includes(r[c[0]]) || !r[c[0]] ? [] : [r[c[0]]]).map(v => '<option' + (v === r[c[0]] ? ' selected' : '') + '>' + esc(v) + '</option>').join('') + '</select>' : '<input data-gr="' + i + '" data-c="' + c[0] + '" value="' + esc(r[c[0]] || '') + '">') + '</td>').join('') + '<td><button class="sm" data-gx="' + i + '"' + (GL.length < 2 ? ' disabled' : '') + '>✕</button></td></tr>').join('') + '</tbody></table>';
      el.querySelectorAll('[data-gr]').forEach(x => x.onchange = () => { GL[+x.dataset.gr][x.dataset.c] = x.value.trim() });
      el.querySelectorAll('[data-gx]').forEach(b => b.onclick = () => { GL.splice(+b.dataset.gx, 1); gDesenha() }) }
    gDesenha();
    $o('#gAdd').onclick = () => { GL.push(Object.assign({}, GL[GL.length - 1])); gDesenha() };
    $o('#gDia').onclick = async () => { const ds = [...new Set(D.rows.filter(r => r.d).map(r => r.d))].sort().reverse(); if (!ds.length) { aviso('Ainda não há linhas na tabela.', true); return }
      const v = await formulario('Copiar as linhas de um dia', [{ id: 'd', tipo: 'select', rotulo: 'Dia da tabela', opcoes: ds.map(d => ({ v: d, t: piFmt(d) + ' · ' + PI_DOW[piD(d).getDay()] + ' · ' + D.rows.filter(r => r.d === d).length + ' linha(s)' })), valor: ds[0] }], 'Copiar'); if (!v) return;
      GL.length = 0; D.rows.filter(r => r.d === v.d).forEach(r => { const x = {}; gcols.forEach(c => x[c[0]] = r[c[0]] || ''); GL.push(x) }); gDesenha() };
    $o('#gOk').onclick = () => { const { a, ws } = semanas(); if (!ws.length) { aviso('Indica a semana (ex.: 47, ou 47-49).', true); return }
      const ds = new Set([...ov.querySelectorAll('[data-gd]:checked')].map(x => +x.dataset.gd)); if (!ds.size) { aviso('Marca os dias da semana.', true); return }
      if (GL.some(l => piMin(l.hi) == null || piMin(l.hf) == null)) { aviso('Horas no formato 00:00 em todas as linhas.', true); return }
      let n = 0; ws.forEach(w => { const s = segunda(w, a); for (let k = 0; k < 7; k++) { const d = new Date(s); d.setDate(s.getDate() + k); if (!ds.has(d.getDay())) continue; const iso = piIso(d);
        GL.forEach(l => { const base = Object.assign({}, l); delete base.hi; delete base.hf;
          if (piMin(l.hi) > piMin(l.hf)) { const d2 = new Date(d); d2.setDate(d2.getDate() + 1); D.rows.push(Object.assign({ d: iso, hi: l.hi, hf: '24:00' }, base), Object.assign({ d: piIso(d2), hi: '00:00', hf: l.hf }, base)); n += 2 }
          else { D.rows.push(Object.assign({ d: iso, hi: l.hi, hf: l.hf }, base)); n++ } }) } });
      D.rows = piOrd(D.rows); grelha(); mexe(); aviso(n + ' período' + (n === 1 ? '' : 's') + ' acrescentado' + (n === 1 ? '' : 's') + '.') };
  } else {
    ov.querySelectorAll('[data-k]').forEach(x => x.addEventListener(x.type === 'checkbox' || x.tagName === 'SELECT' ? 'change' : 'input', () => { D[x.dataset.k] = x.type === 'checkbox' ? x.checked : x.value; mexe() }));
    ov.querySelectorAll('[data-pg]').forEach(x => x.addEventListener(x.type === 'checkbox' ? 'change' : 'input', () => { D.prog[x.dataset.pg] = x.type === 'checkbox' ? x.checked : x.value; mexe() }));
    ov.querySelectorAll('input[name=piPer]').forEach(x => x.onchange = () => { D.periodo = x.value; mexe() });
    ov.querySelectorAll('[data-ch]').forEach(x => x.oninput = () => { D.chefe[+x.dataset.ch] = D.chefe[+x.dataset.ch] || { n: '', c: '' }; D.chefe[+x.dataset.ch][x.dataset.f] = x.value; mexe() });
    $o('#piPti').onclick = async () => { const ptis = PIS.filter(x => x.tipo === 'pti'); const v = await formulario('Trazer períodos do PTI', [{ id: 'p', tipo: 'select', rotulo: 'PTI', opcoes: ptis.map(x => ({ v: x.id, t: x.nome })), valor: ptis[0].id }, { id: 's', rotulo: 'Semana / ano', valor: D.sem || '', ph: '47/2026' }, { id: 'v', tipo: 'select', rotulo: 'Via', opcoes: [{ v: '', t: 'Todas' }].concat(PI_VIAS.map(x => ({ v: x, t: x }))), valor: '' }, { id: 'f', rotulo: 'Frente (estação início → fim, em branco = todas)', lista: [...new Set(ptis.flatMap(x => ((x.dados || {}).rows || []).map(piFrente)))].filter(Boolean) }], 'Trazer'); if (!v) return;
      const N = piDoPTI((ptis.find(x => x.id === v.p).dados || {}).rows || [], v.s, v.v, v.f); if (!N.per.length) { aviso('Não há períodos dessa semana no PTI.', true); return }
      ['sem', 'num', 'via', 'per', 'estI', 'estF', 'intEst', 'ctEst', 'sinI', 'sinF', 'posI', 'posF', 'prog'].forEach(k => { if (k === 'per' || k === 'prog' || !D[k]) D[k] = N[k] }); if (!D.desc) D.desc = N.desc;
      const ed = id => { piEditor(o, Object.assign({}, rec || {}, { id, nome: $o('#piNome').value, dados: D }), tipo, refaz) }; ov.remove(); ed(id) };
  }
  $o('#piNome').oninput = e => { nome = e.target.value; mexe() };
  /* esquemas da obra (como no PDT) */
  const DOCV = { sin: [], ele: [] }, V = $o('#piV'), P = $o('#piP');
  const dv = (async () => { try { const r = await ok(sb.from('obra_esquemas').select('esquemas(id,tipo,nome,estacao,via,troco,ficheiro)').eq('obra_id', o.id)); r.map(x => x.esquemas).filter(Boolean).forEach(e => { const it = { nome: (e.tipo === 'sinalizacao' ? (e.estacao || e.nome) : e.nome) + (e.via || e.troco ? ' · ' + [e.via, e.troco].filter(Boolean).join(' ') : ''), path: e.ficheiro }; (e.tipo === 'sinalizacao' ? DOCV.sin : DOCV.ele).push(it) }) } catch (e) { } })();
  async function abre(k) { await dv; const L = DOCV[k];
    if (!L.length) { V.innerHTML = '<div style="padding:30px;color:#eee">' + (k === 'sin' ? 'Não há esquemas de sinalização associados a esta obra (Interdições → Esquemas de sinalização → Associar da biblioteca).' : 'Não há esquemas elétricos associados a esta obra (Interdições → Esquemas elétricos → Associar da biblioteca).') + '</div>'; return }
    V.innerHTML = '<div style="display:flex;gap:8px;align-items:center;padding:6px 10px;background:var(--sheet);border-bottom:1px solid var(--rule)">' + (L.length > 1 ? '<select id="piVs" style="max-width:420px">' + L.map((x, i) => '<option value="' + i + '">' + esc(x.nome) + '</option>').join('') + '</select>' : '<b style="font-size:13px">' + esc(L[0].nome) + '</b>') + '<span class="sp"></span><button class="sm" id="piVn">Abrir noutra janela</button></div><iframe id="piVi" style="flex:1;border:0;background:#fff;width:100%"></iframe>';
    const car = async i => { const u = await sb.storage.from('documentos').createSignedUrl(L[i].path, 3600); if (u.error) { aviso(erroTxt(u.error), true); return } $o('#piVi').src = u.data.signedUrl; $o('#piVn').onclick = () => window.open(u.data.signedUrl, '_blank') };
    const sl = $o('#piVs'); if (sl) sl.onchange = () => car(+sl.value); car(0) }
  ov.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { ov.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('pri', x === b)); const p = b.dataset.tab === 'prev'; P.style.display = p ? '' : 'none'; V.style.display = p ? 'none' : 'flex'; if (!p) abre(b.dataset.tab) });
  $o('#piPrint').onclick = () => piImprime(pti ? piHtmlPTI(nome, D.rows) : piHtmlPedido(D), pti, nome);
  $o('#piXls').onclick = async () => { try { st('a preparar o Excel…'); if (pti) await piExcelPTI(nome, D.rows); else await piExcelPedido(nome, D); st(sujo ? 'alterações por guardar' : '') } catch (e) { aviso(erroTxt(e), true); st('') } };
  const guarda = async () => { try { st('a guardar…'); const row = { obra_id: o.id, tipo, nome, dados: D, atualizado_em: new Date().toISOString() };
      if (id) await ok(sb.from('pedidos_interdicao').update(row).eq('id', id)); else id = (await ok(sb.from('pedidos_interdicao').insert(row).select('id')))[0].id;
      sujo = false; st('guardado'); aviso('Guardado.'); return true } catch (e) { aviso(erroTxt(e), true); st('não guardado'); return false } };
  $o('#piOk').onclick = guarda;
  $o('#piX').onclick = async () => { if (sujo) { const r = await confirmar('Há alterações por guardar. Guardar antes de fechar? (Cancelar volta ao editor.)', 'Guardar e fechar'); if (!r || !await guarda()) return } ov.remove(); refaz && refaz() };
}
