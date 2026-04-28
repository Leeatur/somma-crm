import type { Demanda } from '../types';
import { STATUS_SITUACAO, TIPOS_PROBLEMA, PRIORIDADES, CORES_PRIORIDADE, CORES_STATUS } from '../types';
import { Calendar, User, Building2, AlertCircle, Edit2, Trash2, Clock, FolderOpen } from 'lucide-react';

interface ListaDemandasProps {
  demandas: Demanda[];
  onEditar: (demanda: Demanda) => void;
  onExcluir: (id: string) => void;
  onVerFichario: (demanda: Demanda) => void;
}

export function ListaDemandas({ demandas, onEditar, onExcluir, onVerFichario }: ListaDemandasProps) {
  if (demandas.length === 0) {
    return (
      <div className="lista-vazia">
        <div className="lista-vazia-icon">📋</div>
        <h3>Nenhuma demanda encontrada</h3>
        <p>Crie uma nova demanda para começar</p>
        <style>{`
          .lista-vazia {
            text-align: center;
            padding: 80px 24px;
            background: var(--color-white);
            border-radius: var(--radius-lg);
            border: 2px dashed var(--color-border);
          }
          .lista-vazia-icon { font-size: 3.5rem; margin-bottom: 16px; }
          .lista-vazia h3 {
            font-family: var(--font-display);
            font-size: 1.5rem;
            color: var(--color-primary);
            margin-bottom: 8px;
          }
          .lista-vazia p { color: var(--color-text-light); font-size: 0.9rem; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="lista-wrap">
      {/* ── Header ── */}
      <div className="lista-head">
        <div className="lh-col lh-cliente">Cliente</div>
        <div className="lh-col lh-marca">Marca</div>
        <div className="lh-col lh-tipo">Tipo</div>
        <div className="lh-col lh-status">Status</div>
        <div className="lh-col lh-prio">Prioridade</div>
        <div className="lh-col lh-data">Data</div>
        <div className="lh-col lh-acoes">Ações</div>
      </div>

      {/* ── Body ── */}
      <div className="lista-body">
        {demandas.map((demanda, idx) => {
          const diasAberto = Math.floor(
            (new Date().getTime() - new Date(demanda.dataCriacao).getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={demanda._id || demanda.id}
              className="lista-row"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="lh-col lh-cliente">
                <div className="lr-client">
                  <span className="lr-avatar">
                    {demanda.nomeCliente.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <span className="lr-client-name">{demanda.nomeCliente}</span>
                    {demanda.encaminhadoPara && (
                      <span className="lr-resp">
                        <User size={10} /> {demanda.encaminhadoPara}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="lh-col lh-marca">
                <div className="lr-cell">
                  <Building2 size={14} />
                  <span>{demanda.marca}</span>
                </div>
              </div>

              <div className="lh-col lh-tipo">
                <div className="lr-cell small">
                  <AlertCircle size={13} />
                  <span>{TIPOS_PROBLEMA[demanda.tipoProblema]}</span>
                </div>
              </div>

              <div className="lh-col lh-status">
                <span
                  className="lr-status"
                  style={{
                    background: `${CORES_STATUS[demanda.status]}14`,
                    color: CORES_STATUS[demanda.status],
                    borderColor: `${CORES_STATUS[demanda.status]}40`,
                  }}
                >
                  {STATUS_SITUACAO[demanda.status]}
                </span>
              </div>

              <div className="lh-col lh-prio">
                <span
                  className="lr-prio"
                  style={{ background: CORES_PRIORIDADE[demanda.prioridade] }}
                >
                  {PRIORIDADES[demanda.prioridade]}
                </span>
              </div>

              <div className="lh-col lh-data">
                <div className="lr-date">
                  <Calendar size={12} />
                  {new Date(demanda.dataContato).toLocaleDateString('pt-BR')}
                </div>
                <span className={`lr-age ${diasAberto > 7 ? 'overdue' : ''}`}>
                  <Clock size={10} /> {diasAberto}d
                </span>
              </div>

              <div className="lh-col lh-acoes">
                <button
                  className="lr-action view"
                  onClick={() => onVerFichario(demanda)}
                  title="Ver Fichário"
                >
                  <FolderOpen size={14} />
                </button>
                <button
                  className="lr-action edit"
                  onClick={() => onEditar(demanda)}
                  title="Editar"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="lr-action del"
                  onClick={() => onExcluir(demanda._id || demanda.id)}
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        /* ── Wrapper ── */
        .lista-wrap {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        /* ── Header ── */
        .lista-head {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1.6fr 1.3fr 100px 130px 90px;
          gap: 12px;
          padding: 13px 20px;
          background: var(--color-cream);
          border-bottom: 1px solid var(--color-border-light);
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-text-muted);
        }

        .lh-col { display: flex; align-items: center; }

        /* ── Body ── */
        .lista-body {
          max-height: calc(100vh - 400px);
          overflow-y: auto;
        }

        /* ── Row ── */
        .lista-row {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1.6fr 1.3fr 100px 130px 90px;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--color-border-light);
          align-items: center;
          transition: background 0.15s;
          animation: fadeIn 0.3s ease-out both;
        }

        .lista-row:last-child { border-bottom: none; }

        .lista-row:hover {
          background: rgba(247, 242, 234, 0.6);
        }

        /* ── Client cell ── */
        .lr-client {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .lr-avatar {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--color-gold-dim);
          color: var(--color-gold);
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lr-client-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--color-primary);
          display: block;
          line-height: 1.3;
        }

        .lr-resp {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.6875rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        /* ── Generic cell ── */
        .lr-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: var(--color-text);
        }

        .lr-cell.small { font-size: 0.8125rem; color: var(--color-text-light); }

        /* ── Status badge ── */
        .lr-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: var(--radius-full);
          font-size: 0.6875rem;
          font-weight: 600;
          border: 1px solid;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        /* ── Priority badge ── */
        .lr-prio {
          display: inline-block;
          padding: 5px 10px;
          border-radius: var(--radius-full);
          font-size: 0.6875rem;
          font-weight: 700;
          color: white;
          text-align: center;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── Date cell ── */
        .lr-date {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8125rem;
          color: var(--color-text-light);
          margin-bottom: 3px;
        }

        .lr-age {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 0.6875rem;
          color: var(--color-text-muted);
          background: var(--color-cream);
          padding: 2px 7px;
          border-radius: var(--radius-full);
        }

        .lr-age.overdue {
          background: #fff1f2;
          color: var(--color-danger);
          font-weight: 600;
        }

        /* ── Action buttons ── */
        .lh-acoes { justify-content: center; }

        .lista-row .lh-acoes {
          display: flex;
          gap: 6px;
          justify-content: flex-start;
        }

        .lr-action {
          width: 30px;
          height: 30px;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .lr-action.view {
          background: rgba(201, 162, 39, 0.1);
          color: #a87820;
        }
        .lr-action.view:hover {
          background: var(--color-gold);
          color: var(--color-primary);
          transform: scale(1.1);
        }
        .lr-action.edit {
          background: rgba(13, 46, 88, 0.08);
          color: var(--color-accent);
        }

        .lr-action.edit:hover {
          background: var(--color-accent);
          color: white;
          transform: scale(1.1);
        }

        .lr-action.del {
          background: rgba(224, 56, 78, 0.08);
          color: var(--color-danger);
        }

        .lr-action.del:hover {
          background: var(--color-danger);
          color: white;
          transform: scale(1.1);
        }

        /* ── Responsive ── */
        @media (max-width: 1200px) {
          .lista-head, .lista-row {
            grid-template-columns: 1.5fr 1fr 1.5fr 1fr 90px 110px 80px;
          }
        }

        @media (max-width: 1024px) {
          .lista-head, .lista-row {
            grid-template-columns: 1.4fr 1fr 120px 80px;
          }
          .lh-tipo, .lh-marca { display: none; }
          .lista-row .lh-tipo, .lista-row .lh-marca { display: none; }
        }

        @media (max-width: 640px) {
          .lista-head, .lista-row {
            grid-template-columns: 1fr 90px 70px;
          }
          .lh-prio, .lh-data { display: none; }
          .lista-row .lh-prio, .lista-row .lh-data { display: none; }
        }
      `}</style>
    </div>
  );
}
