import { useState, useRef } from 'react';
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

export function Relatorio({ demandas, onFechar }: RelatorioProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const printRef = useRef<HTMLDivElement>(null);

  const demandasPorStatus = COLUNAS_KANBAN.map(coluna => ({
    coluna,
    demandas: demandas.filter(d => d.status === coluna.id),
  }));

  const statusVisiveis = filtroStatus === 'todos'
    ? demandasPorStatus
    : demandasPorStatus.filter(s => s.coluna.id === filtroStatus);

  const totalGeral = filtroStatus === 'todos'
    ? demandas.length
    : (demandasPorStatus.find(s => s.coluna.id === filtroStatus)?.demandas.length ?? 0);

  return (
    <div className="rel-overlay">
      <div className="rel-container" ref={printRef}>

        {/* ── Header ── */}
        <div className="rel-header no-print">
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
            <button className="rel-btn-print" onClick={() => window.print()}>
              <Printer size={15} /> Imprimir
            </button>
            <button className="rel-btn-close" onClick={onFechar}><X size={18} /></button>
          </div>
        </div>

        {/* ── Cabeçalho de impressão ── */}
        <div className="print-only rel-print-header">
          <strong>SOMMA — Relatório de Demandas</strong>
          <span>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>

        {/* ── Resumo por status ── */}
        <div className="rel-summary no-print">
          <div className="rel-summary-total">
            <span className="rel-summary-num">{totalGeral}</span>
            <span className="rel-summary-label">demanda{totalGeral !== 1 ? 's' : ''}</span>
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
        <div className="rel-filtros no-print">
          <Filter size={14} className="rel-filtro-icon" />
          <span className="rel-filtro-label">Filtrar por status:</span>
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
                  style={filtroStatus === col.id ? { background: col.cor, borderColor: col.cor, color: '#fff' } : { borderColor: col.cor + '88' }}
                  onClick={() => setFiltroStatus(col.id)}
                >
                  <span className="rel-pill-dot" style={{ background: filtroStatus === col.id ? '#fff' : col.cor }} />
                  {col.titulo} ({qtd})
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Conteúdo ── */}
        <div className="rel-body">
          {statusVisiveis.map(({ coluna, demandas: lista }) => (
            lista.length === 0 && filtroStatus !== 'todos' ? null : (
              <div key={coluna.id} className="rel-status-bloco">
                {/* Cabeçalho do status */}
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
                      const rawData = d.dataCriacao || d.createdAt;
                      const abertura = rawData ? new Date(rawData).toLocaleDateString('pt-BR') : '—';

                      return (
                        <div key={d._id || d.id} className="rel-demanda-card">
                          {/* Número */}
                          <div className="rel-demanda-num" style={{ color: coluna.cor }}>
                            #{String(idx + 1).padStart(2, '0')}
                          </div>

                          <div className="rel-demanda-content">
                            {/* Linha 1: cliente em destaque */}
                            <div className="rel-demanda-title-row">
                              <span className="rel-demanda-nome">{d.nomeCliente}</span>
                              {d.cnpj && <span className="rel-demanda-cnpj">{d.cnpj}</span>}
                              {d.valor && (
                                <span className="rel-demanda-valor">R$ {d.valor}</span>
                              )}
                            </div>

                            {/* Grid de campos */}
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
                                <span className="rel-campo-label">Nome do Contato</span>
                                <span className="rel-campo-valor">{d.razaoSocial || '—'}</span>
                              </div>
                              <div className="rel-campo">
                                <span className="rel-campo-label">Abertura</span>
                                <span className="rel-campo-valor">{abertura}</span>
                              </div>
                            </div>

                            {/* Histórico */}
                            {historico.length > 0 && (
                              <div className="rel-historico">
                                <div className="rel-hist-head">
                                  <span>Data</span>
                                  <span>Referência</span>
                                  <span>Quant.</span>
                                  <span>Descrição</span>
                                  <span>Valor</span>
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
          ))}
        </div>
      </div>

      <style>{`
        .rel-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 24px; overflow-y: auto;
        }

        .rel-container {
          background: #f4f2ee;
          border-radius: 16px;
          width: 100%; max-width: 1020px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.3);
          animation: scaleIn 0.3s cubic-bezier(0.34,1.10,0.64,1);
          overflow: hidden;
        }

        /* ── Header ── */
        .rel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 28px;
          background: linear-gradient(145deg, #0d2e58 0%, #102040 100%);
        }
        .rel-header-left { display: flex; align-items: center; gap: 14px; }
        .rel-logo {
          width: 46px; height: 46px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(145deg, #c9a227, #a87820);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; font-weight: 800; color: #0d2e58;
          box-shadow: 0 4px 14px rgba(201,162,39,0.4);
        }
        .rel-title {
          font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0; letter-spacing: 0.01em;
        }
        .rel-date { font-size: 0.78rem; color: rgba(255,255,255,0.5); margin: 3px 0 0; text-transform: capitalize; }
        .rel-header-right { display: flex; align-items: center; gap: 10px; }
        .rel-btn-print {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          background: linear-gradient(135deg, #c9a227, #a87820);
          color: #0d2e58; border: none; border-radius: 8px;
          font-size: 0.875rem; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 12px rgba(201,162,39,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .rel-btn-print:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,162,39,0.4); }
        .rel-btn-close {
          width: 36px; height: 36px; border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08); border-radius: 8px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); transition: background 0.15s;
        }
        .rel-btn-close:hover { background: rgba(255,255,255,0.18); color: #fff; }

        /* ── Resumo ── */
        .rel-summary {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          padding: 14px 28px;
          background: #fff;
          border-bottom: 1px solid #e8e3da;
          overflow-x: auto;
        }
        .rel-summary-total {
          display: flex; flex-direction: column; align-items: center;
          padding: 6px 16px; border-radius: 10px;
          background: #0d2e58; color: #fff; flex-shrink: 0;
          margin-right: 6px;
        }
        .rel-summary-num { font-size: 1.4rem; font-weight: 800; line-height: 1; }
        .rel-summary-label { font-size: 0.65rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.06em; }
        .rel-summary-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 99px;
          border: 1.5px solid; background: #fff;
          white-space: nowrap; flex-shrink: 0;
        }
        .rel-chip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .rel-chip-label { font-size: 0.72rem; color: #555; font-weight: 500; }
        .rel-chip-count { font-size: 0.8rem; font-weight: 800; }

        /* ── Filtros ── */
        .rel-filtros {
          display: flex; align-items: flex-start; gap: 10px; flex-wrap: wrap;
          padding: 14px 28px 12px;
          background: #faf8f4;
          border-bottom: 1px solid #e8e3da;
        }
        .rel-filtro-icon { color: #888; margin-top: 2px; flex-shrink: 0; }
        .rel-filtro-label {
          font-size: 0.78rem; font-weight: 600; color: #666;
          white-space: nowrap; padding-top: 2px; flex-shrink: 0;
        }
        .rel-filtro-pills { display: flex; flex-wrap: wrap; gap: 6px; }
        .rel-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 13px; border-radius: 99px;
          border: 1.5px solid #ccc; background: #fff;
          font-size: 0.72rem; font-weight: 600; color: #555;
          cursor: pointer; transition: all 0.15s;
        }
        .rel-pill:hover { border-color: #0d2e58; color: #0d2e58; }
        .rel-pill.active { background: #0d2e58; border-color: #0d2e58; color: #fff; }
        .rel-pill-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        /* ── Corpo ── */
        .rel-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 20px; }

        /* ── Bloco por status ── */
        .rel-status-bloco {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .rel-status-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px;
          border-left: 5px solid;
          background: #fafaf8;
          border-bottom: 1px solid #f0ece4;
        }
        .rel-status-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 15px; border-radius: 99px;
          border: 1.5px solid;
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.02em;
        }
        .rel-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .rel-status-count { font-size: 0.78rem; color: #999; font-weight: 500; }
        .rel-vazio { padding: 18px 20px; color: #bbb; font-size: 0.85rem; font-style: italic; margin: 0; }

        /* ── Cards de demanda ── */
        .rel-demandas { display: flex; flex-direction: column; }
        .rel-demanda-card {
          display: flex; gap: 0;
          border-bottom: 1px solid #f0ece4;
        }
        .rel-demanda-card:last-child { border-bottom: none; }
        .rel-demanda-num {
          padding: 16px 14px;
          font-size: 0.75rem; font-weight: 800;
          min-width: 52px;
          border-right: 1px solid #f0ece4;
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: 18px;
        }
        .rel-demanda-content { flex: 1; padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; }

        /* Linha do título */
        .rel-demanda-title-row {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .rel-demanda-nome {
          font-size: 1rem; font-weight: 700; color: #0d2e58;
        }
        .rel-demanda-cnpj {
          font-size: 0.78rem; color: #888;
          background: #f0ece4; padding: 2px 9px; border-radius: 6px;
        }
        .rel-demanda-valor {
          margin-left: auto;
          font-size: 0.95rem; font-weight: 800; color: #15803d;
          background: #dcfce7; padding: 3px 12px; border-radius: 99px;
        }

        /* Grid de campos */
        .rel-campos-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px;
        }
        .rel-campo { display: flex; flex-direction: column; gap: 2px; }
        .rel-campo-label {
          font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; color: #aaa;
        }
        .rel-campo-valor { font-size: 0.82rem; color: #333; font-weight: 500; }

        /* Histórico tabela */
        .rel-historico {
          border: 1px solid #e8e3da; border-radius: 8px; overflow: hidden; margin-top: 4px;
        }
        .rel-hist-head,
        .rel-hist-row {
          display: grid;
          grid-template-columns: 90px 110px 60px 1fr 90px;
        }
        .rel-hist-head {
          background: #f0ece4;
          font-size: 0.66rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em; color: #888;
        }
        .rel-hist-head span,
        .rel-hist-row span {
          padding: 6px 10px;
          border-right: 1px solid #e8e3da;
        }
        .rel-hist-head span:last-child,
        .rel-hist-row span:last-child { border-right: none; }
        .rel-hist-row {
          border-top: 1px solid #e8e3da;
          font-size: 0.8rem; color: #333;
        }
        .rel-hist-row:nth-child(even) { background: #fafaf8; }
        .rh-data { color: #1a56db !important; font-weight: 600 !important; }
        .rh-ref  { color: #7c3aed !important; font-weight: 600 !important; }
        .rh-qty  { color: #92400e !important; font-weight: 600 !important; text-align: center; }
        .rh-val  { color: #15803d !important; font-weight: 700 !important; text-align: right; }

        /* Print */
        .print-only { display: none; }

        @media print {
          .rel-overlay { position: static; background: none; padding: 0; display: block; }
          .rel-container { box-shadow: none; border-radius: 0; max-width: 100%; background: #fff; }
          .no-print { display: none !important; }
          .print-only { display: flex !important; }
          .rel-print-header {
            justify-content: space-between; padding: 12px 0;
            border-bottom: 2px solid #0d2e58; margin-bottom: 16px;
            font-size: 1rem; color: #0d2e58;
          }
          .rel-body { padding: 0; }
          .rel-status-bloco { break-inside: avoid; page-break-inside: avoid; box-shadow: none; border: 1px solid #ddd; }
        }

        @media (max-width: 640px) {
          .rel-campos-grid { grid-template-columns: repeat(2, 1fr); }
          .rel-hist-head, .rel-hist-row { grid-template-columns: 80px 90px 50px 1fr 80px; }
        }
      `}</style>
    </div>
  );
}
