import { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import type { Demanda } from '../types';
import { COLUNAS_KANBAN, TIPOS_PROBLEMA } from '../types';

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

export function Relatorio({ demandas, onFechar }: RelatorioProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const demandasPorStatus = COLUNAS_KANBAN.map(coluna => ({
    coluna,
    demandas: demandas.filter(d => d.status === coluna.id),
  }));

  return (
    <div className="relatorio-overlay">
      <div className="relatorio-container" ref={printRef}>
        {/* Header */}
        <div className="relatorio-header no-print">
          <div className="relatorio-titulo">
            <span className="relatorio-logo">S</span>
            <div>
              <h2>SOMMA — Relatório de Demandas</h2>
              <p>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="relatorio-acoes">
            <button className="btn-print" onClick={handlePrint}>
              <Printer size={16} />
              Imprimir
            </button>
            <button className="btn-fechar-rel" onClick={onFechar}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Print header (only visible on print) */}
        <div className="print-only print-header">
          <strong>SOMMA — Relatório de Demandas</strong>
          <span>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>

        {/* Cards por status */}
        <div className="relatorio-body">
          {demandasPorStatus.map(({ coluna, demandas: lista }) => (
            <div key={coluna.id} className="status-card-rel">
              <div className="status-card-header" style={{ borderLeftColor: coluna.cor }}>
                <div className="status-badge-rel" style={{ background: coluna.cor + '22', color: coluna.cor }}>
                  {coluna.titulo}
                </div>
                <span className="status-count-rel">{lista.length} demanda{lista.length !== 1 ? 's' : ''}</span>
              </div>

              {lista.length === 0 ? (
                <p className="status-vazio">Nenhuma demanda neste status.</p>
              ) : (
                <div className="demandas-rel-lista">
                  {lista.map((d, idx) => {
                    const historico = getHistorico(d);
                    return (
                      <div key={d._id || d.id} className="demanda-rel-item">
                        <div className="demanda-rel-numero">#{idx + 1}</div>
                        <div className="demanda-rel-corpo">
                          <div className="demanda-rel-row">
                            <span className="demanda-rel-campo">Cliente</span>
                            <span className="demanda-rel-valor">{d.nomeCliente || '—'}</span>
                            <span className="demanda-rel-campo">CNPJ</span>
                            <span className="demanda-rel-valor">{d.cnpj || '—'}</span>
                          </div>
                          <div className="demanda-rel-row">
                            <span className="demanda-rel-campo">Marca</span>
                            <span className="demanda-rel-valor">{d.marca || '—'}</span>
                            <span className="demanda-rel-campo">Telefone</span>
                            <span className="demanda-rel-valor">{d.contato || '—'}</span>
                          </div>
                          <div className="demanda-rel-row">
                            <span className="demanda-rel-campo">Tipo</span>
                            <span className="demanda-rel-valor">{TIPOS_PROBLEMA[d.tipoProblema] || d.tipoProblema}</span>
                            <span className="demanda-rel-campo">Valor</span>
                            <span className="demanda-rel-valor">{d.valor || '—'}</span>
                          </div>
                          <div className="demanda-rel-row">
                            <span className="demanda-rel-campo">Abertura</span>
                            <span className="demanda-rel-valor">
                              {d.dataCriacao ? new Date(d.dataCriacao).toLocaleDateString('pt-BR') : '—'}
                            </span>
                            <span className="demanda-rel-campo">Cidade</span>
                            <span className="demanda-rel-valor">{d.cidade || '—'}</span>
                          </div>

                          {historico.length > 0 && (
                            <div className="demanda-rel-historico">
                              <span className="historico-label">Histórico</span>
                              {historico.map((h, hi) => (
                                <div key={h.id || hi} className="historico-entry-rel">
                                  <span className="hist-data">{h.data}</span>
                                  {h.referencias && <span className="hist-ref">{h.referencias}</span>}
                                  {h.valor && <span className="hist-val">{h.valor}</span>}
                                  {h.observacao && <span className="hist-obs">{h.observacao}</span>}
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
          ))}
        </div>
      </div>

      <style>{`
        .relatorio-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 1000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px;
          overflow-y: auto;
        }

        .relatorio-container {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 960px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.3);
          animation: slideInUp 0.3s ease-out;
        }

        .relatorio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid #eee;
        }

        .relatorio-titulo {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .relatorio-logo {
          width: 44px;
          height: 44px;
          background: linear-gradient(145deg, #c9a227, #b8891d);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0d2e58;
          flex-shrink: 0;
        }

        .relatorio-titulo h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0d2e58;
          margin: 0;
        }

        .relatorio-titulo p {
          font-size: 0.8rem;
          color: #888;
          margin: 2px 0 0;
        }

        .relatorio-acoes {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-print {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          background: #0d2e58;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-print:hover { background: #1a4a7a; }

        .btn-fechar-rel {
          width: 36px;
          height: 36px;
          border: none;
          background: #f5f5f5;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: background 0.2s;
        }

        .btn-fechar-rel:hover { background: #e8e8e8; }

        .relatorio-body {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .status-card-rel {
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          overflow: hidden;
        }

        .status-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #fafafa;
          border-left: 4px solid;
          border-bottom: 1px solid #eee;
        }

        .status-badge-rel {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .status-count-rel {
          font-size: 0.8125rem;
          color: #888;
          font-weight: 500;
        }

        .status-vazio {
          padding: 16px 18px;
          color: #aaa;
          font-size: 0.85rem;
          font-style: italic;
          margin: 0;
        }

        .demandas-rel-lista {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .demanda-rel-item {
          display: flex;
          gap: 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .demanda-rel-item:last-child {
          border-bottom: none;
        }

        .demanda-rel-numero {
          padding: 14px 12px;
          font-size: 0.75rem;
          color: #bbb;
          font-weight: 600;
          min-width: 40px;
          border-right: 1px solid #f0f0f0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 16px;
        }

        .demanda-rel-corpo {
          flex: 1;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .demanda-rel-row {
          display: grid;
          grid-template-columns: 70px 1fr 70px 1fr;
          gap: 4px 12px;
          align-items: baseline;
        }

        .demanda-rel-campo {
          font-size: 0.72rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .demanda-rel-valor {
          font-size: 0.875rem;
          color: #1a1a1a;
          font-weight: 500;
        }

        .demanda-rel-historico {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed #eee;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .historico-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .historico-entry-rel {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          font-size: 0.8125rem;
        }

        .hist-data {
          background: #e8f0fe;
          color: #1a56db;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .hist-ref {
          background: #f3e8ff;
          color: #7c3aed;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .hist-val {
          background: #d1fae5;
          color: #065f46;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .hist-obs {
          color: #444;
          font-size: 0.8125rem;
        }

        /* Print */
        .print-only { display: none; }

        @media print {
          .relatorio-overlay {
            position: static;
            background: none;
            padding: 0;
            display: block;
          }

          .relatorio-container {
            box-shadow: none;
            border-radius: 0;
            max-width: 100%;
          }

          .no-print { display: none !important; }

          .print-only { display: flex !important; }

          .print-header {
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 2px solid #0d2e58;
            margin-bottom: 16px;
            font-size: 1rem;
            color: #0d2e58;
          }

          .relatorio-body {
            padding: 0;
          }

          .status-card-rel {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
