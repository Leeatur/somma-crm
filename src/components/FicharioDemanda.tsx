import type { Demanda } from '../types';
import { STATUS_SITUACAO, CORES_STATUS } from '../types';
import { X, User, Building2, Phone, DollarSign, CalendarDays, Tag, FileText, Hash } from 'lucide-react';

interface EntradaHistorico {
  id: string;
  data: string;
  referencias: string;
  observacao: string;
  valor: string;
}

interface FicharioDemandaProps {
  demanda: Demanda;
  onFechar: () => void;
}

function parseHistorico(obs: string | undefined): EntradaHistorico[] {
  if (!obs) return [];
  try {
    const parsed = JSON.parse(obs);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function FicharioDemanda({ demanda, onFechar }: FicharioDemandaProps) {
  const historico: EntradaHistorico[] = demanda.historicoObservacoes?.length
    ? (demanda.historicoObservacoes as unknown as EntradaHistorico[])
    : parseHistorico(demanda.observacoes);

  const statusCor = CORES_STATUS[demanda.status];
  const dataCriacao = demanda.dataCriacao
    ? new Date(demanda.dataCriacao).toLocaleDateString('pt-BR')
    : '—';

  return (
    <div className="fich-overlay" onClick={onFechar}>
      <div className="fich-panel" onClick={e => e.stopPropagation()}>

        {/* ── Capa do fichário ── */}
        <div className="fich-capa">
          <div className="fich-capa-bg" />
          <div className="fich-capa-content">
            <div className="fich-avatar">{demanda.nomeCliente.charAt(0).toUpperCase()}</div>
            <div className="fich-capa-info">
              <h2 className="fich-nome">{demanda.nomeCliente}</h2>
              {demanda.cnpj && <span className="fich-cnpj"><Hash size={12} />{demanda.cnpj}</span>}
              <span
                className="fich-status-badge"
                style={{ background: `${statusCor}22`, color: statusCor, borderColor: `${statusCor}55` }}
              >
                {STATUS_SITUACAO[demanda.status]}
              </span>
            </div>
          </div>
          <button className="fich-close" onClick={onFechar}><X size={20} /></button>
        </div>

        <div className="fich-body">

          {/* ── Dados principais ── */}
          <section className="fich-section">
            <h3 className="fich-section-title">Dados do Cliente</h3>
            <div className="fich-grid">
              <div className="fich-field">
                <span className="fich-field-label"><User size={13} />Cliente</span>
                <span className="fich-field-value">{demanda.nomeCliente || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><Building2 size={13} />CNPJ</span>
                <span className="fich-field-value">{demanda.cnpj || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><Phone size={13} />Telefone</span>
                <span className="fich-field-value">{demanda.contato || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><Building2 size={13} />Marca</span>
                <span className="fich-field-value">{demanda.marca || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><DollarSign size={13} />Valor</span>
                <span className="fich-field-value">{demanda.valor ? `R$ ${demanda.valor}` : '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><CalendarDays size={13} />Aberto em</span>
                <span className="fich-field-value">{dataCriacao}</span>
              </div>
            </div>
          </section>

          {/* ── Histórico de Observações ── */}
          <section className="fich-section">
            <h3 className="fich-section-title">
              <FileText size={15} />
              Histórico de Observações
              {historico.length > 0 && (
                <span className="fich-count">{historico.length}</span>
              )}
            </h3>

            {historico.length === 0 ? (
              <div className="fich-hist-vazio">Nenhuma observação registrada.</div>
            ) : (
              <div className="fich-timeline">
                {historico.map((entrada, idx) => (
                  <div key={entrada.id} className="fich-timeline-item">
                    <div className="fich-timeline-dot" />
                    {idx < historico.length - 1 && <div className="fich-timeline-line" />}
                    <div className="fich-timeline-card">
                      <div className="fich-timeline-meta">
                        {entrada.data && (
                          <span className="fich-meta-tag fich-meta-data">
                            <CalendarDays size={12} />{formatDate(entrada.data)}
                          </span>
                        )}
                        {entrada.referencias && (
                          <span className="fich-meta-tag fich-meta-ref">
                            <Tag size={12} />{entrada.referencias}
                          </span>
                        )}
                        {entrada.valor && (
                          <span className="fich-meta-tag fich-meta-valor">
                            <DollarSign size={12} />R$ {entrada.valor}
                          </span>
                        )}
                      </div>
                      <p className="fich-timeline-obs">{entrada.observacao}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <style>{`
        .fich-overlay {
          position: fixed; inset: 0;
          background: rgba(14, 18, 32, 0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: flex-end;
          z-index: 1100; padding: 0;
          animation: fadeInFast 0.2s ease-out;
        }

        .fich-panel {
          background: var(--color-white);
          width: 100%; max-width: 520px; height: 100vh;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.2);
          animation: slideInRight 0.3s cubic-bezier(0.34,1.10,0.64,1);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        /* ── Capa ── */
        .fich-capa {
          position: relative; padding: 28px 24px 24px;
          background: linear-gradient(145deg, var(--color-primary) 0%, #102040 100%);
          overflow: hidden; flex-shrink: 0;
        }
        .fich-capa-bg {
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .fich-capa::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(201,162,39,0.5), transparent);
        }
        .fich-capa-content { display: flex; align-items: center; gap: 16px; position: relative; }
        .fich-avatar {
          width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(145deg, var(--color-gold) 0%, #a87820 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 1.75rem; font-weight: 700;
          color: var(--color-primary); box-shadow: var(--shadow-gold);
        }
        .fich-capa-info { flex: 1; min-width: 0; }
        .fich-nome {
          font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;
          color: var(--color-white); margin: 0 0 4px; line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .fich-cnpj {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.75rem; color: rgba(255,255,255,0.55); margin-bottom: 8px;
        }
        .fich-status-badge {
          display: inline-block; padding: 4px 11px; border-radius: 99px;
          font-size: 0.7rem; font-weight: 700; border: 1px solid; letter-spacing: 0.03em;
        }
        .fich-close {
          position: absolute; top: 0; right: 0;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7); cursor: pointer; padding: 8px;
          border-radius: var(--radius-sm); display: flex; transition: var(--transition-smooth);
        }
        .fich-close:hover { background: rgba(255,255,255,0.18); color: #fff; }

        /* ── Corpo ── */
        .fich-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }

        .fich-section { }
        .fich-section-title {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;
          color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.06em;
          margin: 0 0 14px; padding-bottom: 8px;
          border-bottom: 2px solid var(--color-border-light);
        }
        .fich-count {
          margin-left: auto; background: var(--color-gold); color: var(--color-primary);
          font-size: 0.7rem; font-weight: 800; border-radius: 99px;
          padding: 2px 8px; letter-spacing: 0;
        }

        /* ── Grid de campos ── */
        .fich-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .fich-field { display: flex; flex-direction: column; gap: 3px; }
        .fich-field-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--color-text-muted);
        }
        .fich-field-value { font-size: 0.9375rem; color: var(--color-text); font-weight: 500; }

        /* ── Timeline ── */
        .fich-timeline { display: flex; flex-direction: column; gap: 0; }
        .fich-timeline-item { display: flex; gap: 14px; position: relative; }
        .fich-timeline-dot {
          flex-shrink: 0; width: 12px; height: 12px; border-radius: 50%;
          background: var(--color-gold); border: 2px solid var(--color-white);
          box-shadow: 0 0 0 2px var(--color-gold);
          margin-top: 4px; position: relative; z-index: 1;
        }
        .fich-timeline-line {
          position: absolute; left: 5px; top: 16px; bottom: -16px;
          width: 2px; background: var(--color-border-light);
        }
        .fich-timeline-card {
          flex: 1; background: var(--color-cream, #fafaf8);
          border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
          padding: 12px 14px; margin-bottom: 16px;
          transition: var(--transition-smooth);
        }
        .fich-timeline-card:hover { border-color: var(--color-gold); box-shadow: 0 2px 10px rgba(201,162,39,0.1); }
        .fich-timeline-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .fich-meta-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: 99px; font-size: 0.7rem; font-weight: 600;
        }
        .fich-meta-data  { background: #e0f2fe; color: #0369a1; }
        .fich-meta-ref   { background: #f3e8ff; color: #7c3aed; }
        .fich-meta-valor { background: #dcfce7; color: #15803d; }
        .fich-timeline-obs {
          font-size: 0.875rem; color: var(--color-text); line-height: 1.6;
          margin: 0; white-space: pre-wrap;
        }

        .fich-hist-vazio {
          text-align: center; padding: 32px 20px;
          color: var(--color-text-muted); font-size: 0.875rem;
          background: var(--color-cream, #fafaf8);
          border: 1.5px dashed var(--color-border); border-radius: var(--radius-md);
        }

        @media (max-width: 640px) {
          .fich-panel { max-width: 100%; }
          .fich-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
