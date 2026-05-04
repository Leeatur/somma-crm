import { useState } from 'react';
import { Printer, X, Filter } from 'lucide-react';
import type { Demanda } from '../types';
import { COLUNAS_KANBAN } from '../types';

interface RelatorioProps {
  demandas: Demanda[];
  onFechar: () => void;
}

interface EntradaHistorico {
  id: string;
  data: string;
  referencias: string;
  observacao: string;
  valor: string;
  quantidade?: string;
}

function parseHistorico(obs: string | undefined): EntradaHistorico[] {
  if (!obs) return [];
  try {
    const parsed = JSON.parse(obs);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function getHistorico(demanda: Demanda): EntradaHistorico[] {
  if (demanda.historicoObservacoes?.length) return demanda.historicoObservacoes as EntradaHistorico[];
  return parseHistorico(demanda.observacoes);
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return iso;
}

// Gera HTML limpo para impressão numa nova janela
function buildPrintHtml(
  demandas: Demanda[],
  statusVisiveis: { coluna: typeof COLUNAS_KANBAN[0]; demandas: Demanda[] }[]
): string {
  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const renderHistorico = (historico: EntradaHistorico[]) => {
    if (!historico.length) return '';
    const rows = historico.map(h => `
      <tr>
        <td style="color:#1a56db;font-weight:600">${h.data ? formatDate(h.data) : '—'}</td>
        <td style="color:#7c3aed;font-weight:600">${h.referencias || '—'}</td>
        <td style="text-align:center;color:#92400e;font-weight:600">${h.quantidade || '—'}</td>
        <td>${h.observacao || '—'}</td>
        <td style="text-align:right;color:#15803d;font-weight:700">${h.valor ? `R$ ${h.valor}` : '—'}</td>
      </tr>
    `).join('');
    return `
      <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:7.5pt">
        <thead>
          <tr style="background:#f0ece4;color:#888">
            <th style="padding:4px 7px;text-align:left;font-size:6.5pt;text-transform:uppercase;letter-spacing:.05em;border:1px solid #e0dbd2">Data</th>
            <th style="padding:4px 7px;text-align:left;font-size:6.5pt;text-transform:uppercase;letter-spacing:.05em;border:1px solid #e0dbd2">Referência</th>
            <th style="padding:4px 7px;text-align:center;font-size:6.5pt;text-transform:uppercase;letter-spacing:.05em;border:1px solid #e0dbd2">Quant.</th>
            <th style="padding:4px 7px;text-align:left;font-size:6.5pt;text-transform:uppercase;letter-spacing:.05em;border:1px solid #e0dbd2">Descrição</th>
            <th style="padding:4px 7px;text-align:right;font-size:6.5pt;text-transform:uppercase;letter-spacing:.05em;border:1px solid #e0dbd2">Valor</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  };

  const blocks = statusVisiveis.map(({ coluna, demandas: lista }) => {
    if (!lista.length) return '';
    const items = lista.map((d, idx) => {
      const historico = getHistorico(d);
      const rawData = (d as any).dataCriacao || (d as any).createdAt;
      const abertura = rawData ? new Date(rawData).toLocaleDateString('pt-BR') : '—';
      return `
        <tr style="border-bottom:1px solid #f0ece4;vertical-align:top">
          <td style="padding:7px 8px;font-size:7pt;color:${coluna.cor};font-weight:800;white-space:nowrap">#${String(idx+1).padStart(2,'0')}</td>
          <td style="padding:7px 8px">
            <div style="font-size:8.5pt;font-weight:700;color:#0d2e58">${d.nomeCliente}</div>
            ${d.cnpj ? `<div style="font-size:7pt;color:#888;margin-top:1px">${d.cnpj}</div>` : ''}
            <div style="display:flex;gap:12px;margin-top:5px;flex-wrap:wrap">
              <span><span style="font-size:6pt;text-transform:uppercase;color:#aaa;font-weight:700">Marca </span><span style="font-size:7.5pt;color:#333">${d.marca||'—'}</span></span>
              <span><span style="font-size:6pt;text-transform:uppercase;color:#aaa;font-weight:700">Representante </span><span style="font-size:7.5pt;color:#333">${(d as any).representante||'—'}</span></span>
              <span><span style="font-size:6pt;text-transform:uppercase;color:#aaa;font-weight:700">Contato </span><span style="font-size:7.5pt;color:#333">${d.contato||'—'}</span></span>
              <span><span style="font-size:6pt;text-transform:uppercase;color:#aaa;font-weight:700">Cidade </span><span style="font-size:7.5pt;color:#333">${d.cidade||'—'}</span></span>
              <span><span style="font-size:6pt;text-transform:uppercase;color:#aaa;font-weight:700">Abertura </span><span style="font-size:7.5pt;color:#333">${abertura}</span></span>
              ${d.valor ? `<span style="font-size:7.5pt;color:#15803d;font-weight:700">R$ ${d.valor}</span>` : ''}
            </div>
            ${renderHistorico(historico)}
          </td>
        </tr>`;
    }).join('');

    return `
      <div style="margin-bottom:14px;border:1px solid #e0dbd2;border-radius:8px;overflow:hidden;page-break-inside:avoid">
        <div style="padding:8px 12px;background:#fafaf8;border-left:4px solid ${coluna.cor};border-bottom:1px solid #e0dbd2;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:8pt;font-weight:700;color:${coluna.cor}">${coluna.titulo}</span>
          <span style="font-size:7.5pt;color:#999">${lista.length} demanda${lista.length !== 1 ? 's' : ''}</span>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tbody>${items}</tbody>
        </table>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório de Demandas — SOMMA</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#fff; color:#1a1a1a; padding: 20mm 10mm 10mm 20mm; font-size:8pt; }
    @page {
      margin-top: 20mm;
      margin-left: 20mm;
      margin-bottom: 10mm;
      margin-right: 10mm;
    }
    @media print {
      body {
        padding: 0;
        margin-top: 20mm;
        margin-left: 20mm;
        margin-bottom: 10mm;
        margin-right: 10mm;
      }
    }
    td, th { font-family: inherit; }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:2px solid #0d2e58;margin-bottom:14px">
    <div>
      <div style="font-size:13pt;font-weight:800;color:#0d2e58">SOMMA — Relatório de Demandas</div>
      <div style="font-size:8pt;color:#888;margin-top:2px">${dataHoje} · ${demandas.length} demandas no total</div>
    </div>
  </div>
  ${blocks}
</body>
</html>`;
}

export function Relatorio({ demandas, onFechar }: RelatorioProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const demandasPorStatus = COLUNAS_KANBAN.map(coluna => ({
    coluna,
    demandas: demandas.filter(d => d.status === coluna.id),
  }));

  const statusVisiveis = filtroStatus === 'todos'
    ? demandasPorStatus
    : demandasPorStatus.filter(s => s.coluna.id === filtroStatus);

  const totalVisiveis = statusVisiveis.reduce((a, s) => a + s.demandas.length, 0);

  const handlePrint = () => {
    const html = buildPrintHtml(demandas, statusVisiveis);
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { alert('Permita pop-ups para imprimir.'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };

  return (
    <div className="rel-overlay">
      <div className="rel-container">

        {/* ── Header ── */}
        <div className="rel-header">
          <div className="rel-header-left">
            <div className="rel-logo">S</div>
            <div>
              <h2 className="rel-title">Relatório de Demandas</h2>
              <p className="rel-date">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="rel-header-right">
            <button className="rel-btn-print" onClick={handlePrint}>
              <Printer size={14} /> Imprimir
            </button>
            <button className="rel-btn-close" onClick={onFechar}><X size={17} /></button>
          </div>
        </div>

        {/* ── Resumo ── */}
        <div className="rel-summary">
          <div className="rel-summary-total">
            <span className="rel-summary-num">{totalVisiveis}</span>
            <span className="rel-summary-label">demanda{totalVisiveis !== 1 ? 's' : ''}</span>
          </div>
          {COLUNAS_KANBAN.map(col => {
            const qtd = demandas.filter(d => d.status === col.id).length;
            return (
              <div key={col.id} className="rel-summary-chip" style={{ borderColor: col.cor + '55' }}>
                <span className="rel-chip-dot" style={{ background: col.cor }} />
                <span className="rel-chip-label">{col.titulo}</span>
                <span className="rel-chip-count" style={{ color: col.cor }}>{qtd}</span>
              </div>
            );
          })}
        </div>

        {/* ── Filtros ── */}
        <div className="rel-filtros">
          <Filter size={13} className="rel-filtro-icon" />
          <span className="rel-filtro-label">Filtrar:</span>
          <div className="rel-filtro-pills">
            <button
              className={`rel-pill ${filtroStatus === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltroStatus('todos')}
            >
              Todos ({demandas.length})
            </button>
            {COLUNAS_KANBAN.map(col => {
              const qtd = demandas.filter(d => d.status === col.id).length;
              return (
                <button
                  key={col.id}
                  className={`rel-pill ${filtroStatus === col.id ? 'active' : ''}`}
                  style={filtroStatus === col.id
                    ? { background: col.cor, borderColor: col.cor, color: '#fff' }
                    : { borderColor: col.cor + '88' }}
                  onClick={() => setFiltroStatus(col.id)}
                >
                  <span className="rel-pill-dot" style={{ background: filtroStatus === col.id ? '#fff' : col.cor }} />
                  {col.titulo} ({qtd})
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Corpo ── */}
        <div className="rel-body">
          {statusVisiveis.map(({ coluna, demandas: lista }) =>
            lista.length === 0 && filtroStatus !== 'todos' ? null : (
              <div key={coluna.id} className="rel-status-bloco">
                <div className="rel-status-header" style={{ borderLeftColor: coluna.cor }}>
                  <div className="rel-status-pill" style={{ background: coluna.cor + '18', color: coluna.cor, borderColor: coluna.cor + '44' }}>
                    <span className="rel-status-dot" style={{ background: coluna.cor }} />
                    {coluna.titulo}
                  </div>
                  <span className="rel-status-count">{lista.length} demanda{lista.length !== 1 ? 's' : ''}</span>
                </div>

                {lista.length === 0 ? (
                  <p className="rel-vazio">Nenhuma demanda neste status.</p>
                ) : (
                  <div className="rel-demandas">
                    {lista.map((d, idx) => {
                      const historico = getHistorico(d);
                      const rawData = (d as any).dataCriacao || (d as any).createdAt;
                      const abertura = rawData ? new Date(rawData).toLocaleDateString('pt-BR') : '—';

                      return (
                        <div key={d._id || d.id} className="rel-demanda-card">
                          <div className="rel-demanda-num" style={{ color: coluna.cor }}>
                            #{String(idx + 1).padStart(2, '0')}
                          </div>
                          <div className="rel-demanda-content">
                            <div className="rel-demanda-title-row">
                              <span className="rel-demanda-nome">{d.nomeCliente}</span>
                              {d.cnpj && <span className="rel-demanda-cnpj">{d.cnpj}</span>}
                              {d.valor && <span className="rel-demanda-valor">R$ {d.valor}</span>}
                            </div>
                            <div className="rel-campos-grid">
                              <div className="rel-campo">
                                <span className="rel-campo-label">Marca</span>
                                <span className="rel-campo-valor">{d.marca || '—'}</span>
                              </div>
                              <div className="rel-campo">
                                <span className="rel-campo-label">Representante</span>
                                <span className="rel-campo-valor">{(d as any).representante || '—'}</span>
                              </div>
                              <div className="rel-campo">
                                <span className="rel-campo-label">Contato</span>
                                <span className="rel-campo-valor">{d.contato || '—'}</span>
                              </div>
                              <div className="rel-campo">
                                <span className="rel-campo-label">Cidade</span>
                                <span className="rel-campo-valor">{d.cidade || '—'}</span>
                              </div>
                              <div className="rel-campo">
                                <span className="rel-campo-label">Nome Contato</span>
                                <span className="rel-campo-valor">{d.razaoSocial || '—'}</span>
                              </div>
                              <div className="rel-campo">
                                <span className="rel-campo-label">Abertura</span>
                                <span className="rel-campo-valor">{abertura}</span>
                              </div>
                            </div>
                            {historico.length > 0 && (
                              <div className="rel-historico">
                                <div className="rel-hist-head">
                                  <span>Data</span><span>Referência</span>
                                  <span>Quant.</span><span>Descrição</span><span>Valor</span>
                                </div>
                                {historico.map((h, hi) => (
                                  <div key={h.id || hi} className="rel-hist-row">
                                    <span className="rh-data">{h.data ? formatDate(h.data) : '—'}</span>
                                    <span className="rh-ref">{h.referencias || '—'}</span>
                                    <span className="rh-qty">{h.quantidade || '—'}</span>
                                    <span className="rh-desc">{h.observacao || '—'}</span>
                                    <span className="rh-val">{h.valor ? `R$ ${h.valor}` : '—'}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      <style>{`
        .rel-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 20px; overflow-y: auto;
        }
        .rel-container {
          background: #f4f2ee; border-radius: 14px;
          width: 100%; max-width: 1020px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.28);
          animation: scaleIn 0.28s cubic-bezier(0.34,1.10,0.64,1);
          overflow: hidden;
        }

        /* Header */
        .rel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px;
          background: linear-gradient(145deg, #0d2e58 0%, #102040 100%);
        }
        .rel-header-left { display: flex; align-items: center; gap: 12px; }
        .rel-logo {
          width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(145deg, #c9a227, #a87820);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; font-weight: 800; color: #0d2e58;
          box-shadow: 0 4px 12px rgba(201,162,39,0.4);
        }
        .rel-title { font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0; }
        .rel-date { font-size: 0.7rem; color: rgba(255,255,255,0.5); margin: 2px 0 0; text-transform: capitalize; }
        .rel-header-right { display: flex; align-items: center; gap: 8px; }
        .rel-btn-print {
          display: flex; align-items: center; gap: 6px; padding: 7px 15px;
          background: linear-gradient(135deg, #c9a227, #a87820);
          color: #0d2e58; border: none; border-radius: 7px;
          font-size: 0.78rem; font-weight: 700; cursor: pointer;
          box-shadow: 0 3px 10px rgba(201,162,39,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .rel-btn-print:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(201,162,39,0.4); }
        .rel-btn-close {
          width: 32px; height: 32px; border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08); border-radius: 7px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); transition: background 0.15s;
        }
        .rel-btn-close:hover { background: rgba(255,255,255,0.18); color: #fff; }

        /* Resumo */
        .rel-summary {
          display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
          padding: 10px 18px; background: #fff; border-bottom: 1px solid #e8e3da;
          overflow-x: auto;
        }
        .rel-summary-total {
          display: flex; flex-direction: column; align-items: center;
          padding: 4px 13px; border-radius: 8px;
          background: #0d2e58; color: #fff; flex-shrink: 0; margin-right: 4px;
        }
        .rel-summary-num { font-size: 1.2rem; font-weight: 800; line-height: 1; }
        .rel-summary-label { font-size: 0.58rem; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.06em; }
        .rel-summary-chip {
          display: flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 99px; border: 1.5px solid;
          background: #fff; white-space: nowrap; flex-shrink: 0;
        }
        .rel-chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .rel-chip-label { font-size: 0.65rem; color: #555; font-weight: 500; }
        .rel-chip-count { font-size: 0.72rem; font-weight: 800; }

        /* Filtros */
        .rel-filtros {
          display: flex; align-items: flex-start; gap: 8px; flex-wrap: wrap;
          padding: 10px 18px 9px; background: #faf8f4; border-bottom: 1px solid #e8e3da;
        }
        .rel-filtro-icon { color: #888; margin-top: 2px; flex-shrink: 0; }
        .rel-filtro-label { font-size: 0.72rem; font-weight: 600; color: #666; white-space: nowrap; padding-top: 3px; flex-shrink: 0; }
        .rel-filtro-pills { display: flex; flex-wrap: wrap; gap: 5px; }
        .rel-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 11px; border-radius: 99px;
          border: 1.5px solid #ccc; background: #fff;
          font-size: 0.67rem; font-weight: 600; color: #555;
          cursor: pointer; transition: all 0.15s;
        }
        .rel-pill:hover { border-color: #0d2e58; color: #0d2e58; }
        .rel-pill.active { background: #0d2e58; border-color: #0d2e58; color: #fff; }
        .rel-pill-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* Corpo */
        .rel-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 14px; }

        /* Bloco status */
        .rel-status-bloco { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 5px rgba(0,0,0,0.07); }
        .rel-status-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 14px; border-left: 4px solid; background: #fafaf8; border-bottom: 1px solid #f0ece4;
        }
        .rel-status-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 99px; border: 1.5px solid;
          font-size: 0.73rem; font-weight: 700; letter-spacing: 0.02em;
        }
        .rel-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .rel-status-count { font-size: 0.7rem; color: #999; font-weight: 500; }
        .rel-vazio { padding: 12px 14px; color: #bbb; font-size: 0.75rem; font-style: italic; margin: 0; }

        /* Cards demanda */
        .rel-demandas { display: flex; flex-direction: column; }
        .rel-demanda-card {
          display: flex; gap: 0; border-bottom: 1px solid #f0ece4;
        }
        .rel-demanda-card:last-child { border-bottom: none; }
        .rel-demanda-num {
          padding: 12px 10px; font-size: 0.68rem; font-weight: 800;
          min-width: 44px; border-right: 1px solid #f0ece4;
          display: flex; align-items: flex-start; justify-content: center; padding-top: 14px;
        }
        .rel-demanda-content { flex: 1; padding: 10px 14px; display: flex; flex-direction: column; gap: 7px; }

        .rel-demanda-title-row {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .rel-demanda-nome { font-size: 0.875rem; font-weight: 700; color: #0d2e58; }
        .rel-demanda-cnpj {
          font-size: 0.7rem; color: #888; background: #f0ece4; padding: 2px 7px; border-radius: 5px;
        }
        .rel-demanda-valor {
          margin-left: auto; font-size: 0.8rem; font-weight: 800; color: #15803d;
          background: #dcfce7; padding: 2px 10px; border-radius: 99px;
        }

        .rel-campos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px 14px; }
        .rel-campo { display: flex; flex-direction: column; gap: 1px; }
        .rel-campo-label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #aaa; }
        .rel-campo-valor { font-size: 0.75rem; color: #333; font-weight: 500; }

        /* Tabela histórico */
        .rel-historico { border: 1px solid #e8e3da; border-radius: 6px; overflow: hidden; margin-top: 2px; }
        .rel-hist-head, .rel-hist-row {
          display: grid; grid-template-columns: 84px 100px 56px 1fr 80px;
        }
        .rel-hist-head {
          background: #f0ece4; font-size: 0.6rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em; color: #888;
        }
        .rel-hist-head span, .rel-hist-row span {
          padding: 4px 8px; border-right: 1px solid #e8e3da;
        }
        .rel-hist-head span:last-child, .rel-hist-row span:last-child { border-right: none; }
        .rel-hist-row { border-top: 1px solid #e8e3da; font-size: 0.72rem; color: #333; }
        .rel-hist-row:nth-child(even) { background: #fafaf8; }
        .rh-data { color: #1a56db !important; font-weight: 600 !important; }
        .rh-ref  { color: #7c3aed !important; font-weight: 600 !important; }
        .rh-qty  { color: #92400e !important; font-weight: 600 !important; text-align: center; }
        .rh-val  { color: #15803d !important; font-weight: 700 !important; text-align: right; }

        @media (max-width: 640px) {
          .rel-campos-grid { grid-template-columns: repeat(2, 1fr); }
          .rel-hist-head, .rel-hist-row { grid-template-columns: 75px 85px 45px 1fr 72px; }
        }
      `}</style>
    </div>
  );
}
