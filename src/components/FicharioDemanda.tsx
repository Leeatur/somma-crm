import type { Demanda } from '../types';
import { STATUS_SITUACAO, CORES_STATUS } from '../types';
import { X, User, Building2, Phone, DollarSign, CalendarDays, FileText, Hash, Edit2, Trash2, MapPin } from 'lucide-react';

interface EntradaHistorico {
  id: string;
  data: string;
  referencias: string;
  observacao: string;
  valor: string;
  quantidade?: string;
}

interface FicharioDemandaProps {
  demanda: Demanda;
  onFechar: () => void;
  onEditar?: (demanda: Demanda) => void;
  onExcluir?: (id: string) => void;
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

export function FicharioDemanda({ demanda, onFechar, onEditar, onExcluir }: FicharioDemandaProps) {
  const historico: EntradaHistorico[] = demanda.historicoObservacoes?.length
    ? (demanda.historicoObservacoes as unknown as EntradaHistorico[])
    : parseHistorico(demanda.observacoes);

  const statusCor = CORES_STATUS[demanda.status];
  const rawData = demanda.dataCriacao || demanda.createdAt || demanda.updatedAt;
  const dataCriacao = rawData
    ? new Date(rawData).toLocaleDateString('pt-BR')
    : '—';

  return (
    <div className="fich-overlay" onClick={onFechar}>
      <div className="fich-modal" onClick={e => e.stopPropagation()}>

        {/* ── Cabeçalho ── */}
        <div className="fich-header">
          <div className="fich-header-bg" />
          <div className="fich-header-content">
            <div className="fich-avatar">{demanda.nomeCliente.charAt(0).toUpperCase()}</div>
            <div className="fich-header-info">
              <h2 className="fich-nome">{demanda.nomeCliente}</h2>
              {demanda.cnpj && (
                <span className="fich-cnpj"><Hash size={12} />{demanda.cnpj}</span>
              )}
              <span
                className="fich-status-badge"
                style={{ background: `${statusCor}22`, color: statusCor, borderColor: `${statusCor}55` }}
              >
                {STATUS_SITUACAO[demanda.status]}
              </span>
            </div>
          </div>

          <div className="fich-header-actions">
            {onEditar && (
              <button className="fich-btn-edit" onClick={() => { onEditar(demanda); onFechar(); }}>
                <Edit2 size={15} /> Editar
              </button>
            )}
            {onExcluir && (
              <button className="fich-btn-delete" title="Excluir" onClick={() => {
                if (confirm('Excluir esta demanda?')) { onExcluir(demanda._id || demanda.id); onFechar(); }
              }}>
                <Trash2 size={15} />
              </button>
            )}
            <button className="fich-close" onClick={onFechar}><X size={20} /></button>
          </div>
        </div>

        {/* ── Corpo ── */}
        <div className="fich-body">

          {/* ── Grid de dados em 3 colunas ── */}
          <section className="fich-section">
            <h3 className="fich-section-title">Dados do Cliente</h3>
            <div className="fich-grid">
              <div className="fich-field">
                <span className="fich-field-label"><User size={12} />Cliente</span>
                <span className="fich-field-value">{demanda.nomeCliente || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><Building2 size={12} />CNPJ</span>
                <span className="fich-field-value">{demanda.cnpj || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><CalendarDays size={12} />Aberto em</span>
                <span className="fich-field-value">{dataCriacao}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><User size={12} />Nome do Contato</span>
                <span className="fich-field-value">{demanda.razaoSocial || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><Phone size={12} />Contato</span>
                <span className="fich-field-value">{demanda.contato || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><MapPin size={12} />Cidade</span>
                <span className="fich-field-value">{demanda.cidade || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><Building2 size={12} />Marca</span>
                <span className="fich-field-value">{demanda.marca || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><User size={12} />Representante</span>
                <span className="fich-field-value">{(demanda as any).representante || '—'}</span>
              </div>
              <div className="fich-field">
                <span className="fich-field-label"><DollarSign size={12} />Valor Total</span>
                <span className="fich-field-value fich-valor">{demanda.valor ? `R$ ${demanda.valor}` : '—'}</span>
              </div>
            </div>
          </section>

          {/* ── Histórico ── */}
          <section className="fich-section">
            <h3 className="fich-section-title">
              <FileText size={15} />
              Histórico de Observações
              {historico.length > 0 && <span className="fich-count">{historico.length}</span>}
            </h3>

            {historico.length === 0 ? (
              <div className="fich-hist-vazio">Nenhuma observação registrada.</div>
            ) : (
              <div className="fich-hist-table">
                <div className="fich-hist-head">
                  <span>Data</span>
                  <span>Referência</span>
                  <span>Quant.</span>
                  <span>Descrição</span>
                  <span>Valor</span>
                </div>
                {historico.map((entrada, idx) => (
                  <div key={entrada.id || idx} className="fich-hist-row">
                    <span className="fich-hist-cell-data">
                      {entrada.data ? formatDate(entrada.data) : '—'}
                    </span>
                    <span className="fich-hist-cell-ref">{entrada.referencias || '—'}</span>
                    <span className="fich-hist-cell-qty">{entrada.quantidade || '—'}</span>
                    <span className="fich-hist-cell-desc">{entrada.observacao || '—'}</span>
                    <span className="fich-hist-cell-val">{entrada.valor ? `R$ ${entrada.valor}` : '—'}</span>
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
          background: rgba(14, 18, 32, 0.70);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1100; padding: 24px;
          animation: fadeInFast 0.2s ease-out;
        }

        .fich-modal {
          background: var(--color-white);
          width: 100%; max-width: 860px;
          max-height: 90vh;
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex; flex-direction: column;
          box-shadow: 0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06);
          animation: scaleIn 0.3s cubic-bezier(0.34,1.10,0.64,1);
        }

        /* ── Cabeçalho ── */
        .fich-header {
          position: relative;
          padding: 28px 28px 24px;
          background: linear-gradient(145deg, var(--color-primary) 0%, #102040 100%);
          overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
        }
        .fich-header-bg {
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        .fich-header::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(201,162,39,0.5), transparent);
        }
        .fich-header-content {
          display: flex; align-items: center; gap: 16px;
          position: relative; flex: 1; min-width: 0;
        }
        .fich-avatar {
          width: 60px; height: 60px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(145deg, var(--color-gold) 0%, #a87820 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 1.9rem; font-weight: 700;
          color: var(--color-primary); box-shadow: var(--shadow-gold);
        }
        .fich-header-info { flex: 1; min-width: 0; }
        .fich-nome {
          font-family: var(--font-display); font-size: 1.45rem; font-weight: 700;
          color: var(--color-white); margin: 0 0 4px; line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .fich-cnpj {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.75rem; color: rgba(255,255,255,0.55); margin-bottom: 8px;
        }
        .fich-status-badge {
          display: inline-block; padding: 4px 12px; border-radius: 99px;
          font-size: 0.7rem; font-weight: 700; border: 1px solid; letter-spacing: 0.03em;
        }

        .fich-header-actions {
          display: flex; align-items: center; gap: 8px; position: relative; flex-shrink: 0;
        }
        .fich-btn-edit {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px;
          background: var(--color-gold);
          color: var(--color-primary);
          border: none; border-radius: var(--radius-sm);
          font-size: 0.8rem; font-weight: 700;
          cursor: pointer; transition: var(--transition-smooth);
        }
        .fich-btn-edit:hover { background: #e6b820; }
        .fich-btn-delete {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7); border-radius: var(--radius-sm);
          cursor: pointer; transition: var(--transition-smooth);
        }
        .fich-btn-delete:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
        .fich-close {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7); cursor: pointer;
          border-radius: var(--radius-sm); transition: var(--transition-smooth);
        }
        .fich-close:hover { background: rgba(255,255,255,0.18); color: #fff; }

        /* ── Corpo ── */
        .fich-body {
          flex: 1; overflow-y: auto; padding: 28px 32px;
          display: flex; flex-direction: column; gap: 28px;
        }

        .fich-section-title {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-size: 0.85rem; font-weight: 700;
          color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.07em;
          margin: 0 0 16px; padding-bottom: 10px;
          border-bottom: 2px solid var(--color-border-light);
        }
        .fich-count {
          margin-left: auto; background: var(--color-gold); color: var(--color-primary);
          font-size: 0.7rem; font-weight: 800; border-radius: 99px;
          padding: 2px 9px; letter-spacing: 0;
        }

        /* ── Grid 3 colunas ── */
        .fich-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 24px;
        }
        .fich-field { display: flex; flex-direction: column; gap: 4px; }
        .fich-field-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.07em; color: var(--color-text-muted);
        }
        .fich-field-value {
          font-size: 0.9375rem; color: var(--color-text); font-weight: 500;
          padding: 6px 10px;
          background: var(--color-cream);
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-light);
        }
        .fich-valor { color: #15803d !important; font-weight: 700 !important; }

        /* ── Tabela de histórico ── */
        .fich-hist-table {
          width: 100%;
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .fich-hist-head,
        .fich-hist-row {
          display: grid;
          grid-template-columns: 100px 120px 70px 1fr 100px;
        }
        .fich-hist-head {
          background: var(--color-primary);
          color: rgba(255,255,255,0.75);
          font-size: 0.68rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .fich-hist-head span,
        .fich-hist-row span {
          padding: 9px 12px;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .fich-hist-row span {
          border-right-color: var(--color-border-light);
          font-size: 0.8125rem; color: var(--color-text);
        }
        .fich-hist-head span:last-child,
        .fich-hist-row span:last-child { border-right: none; }

        .fich-hist-row {
          border-top: 1px solid var(--color-border-light);
          transition: background 0.15s;
        }
        .fich-hist-row:nth-child(even) { background: #fafaf8; }
        .fich-hist-row:hover { background: #fef9ec; }

        .fich-hist-cell-data { color: #0369a1 !important; font-weight: 600 !important; }
        .fich-hist-cell-ref  { color: #7c3aed !important; font-weight: 600 !important; }
        .fich-hist-cell-qty  { color: #92400e !important; font-weight: 600 !important; text-align: center; }
        .fich-hist-cell-val  { color: #15803d !important; font-weight: 700 !important; }
        .fich-hist-cell-desc { color: var(--color-text) !important; }

        .fich-hist-vazio {
          text-align: center; padding: 36px 20px;
          color: var(--color-text-muted); font-size: 0.875rem;
          background: var(--color-cream);
          border: 1.5px dashed var(--color-border); border-radius: var(--radius-md);
        }

        @media (max-width: 768px) {
          .fich-modal { max-height: 100vh; border-radius: 0; }
          .fich-overlay { padding: 0; }
          .fich-grid { grid-template-columns: repeat(2, 1fr); }
          .fich-hist-head,
          .fich-hist-row { grid-template-columns: 90px 90px 50px 1fr 80px; }
        }
        @media (max-width: 480px) {
          .fich-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
