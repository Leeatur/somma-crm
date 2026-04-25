import type { Demanda } from '../types';
import { STATUS_SITUACAO, TIPOS_PROBLEMA, PRIORIDADES, CORES_PRIORIDADE, CORES_STATUS } from '../types';
import { Calendar, User, Building2, AlertCircle, Edit2, Trash2, Clock } from 'lucide-react';

interface ListaDemandasProps {
  demandas: Demanda[];
  onEditar: (demanda: Demanda) => void;
  onExcluir: (id: string) => void;
}

export function ListaDemandas({ demandas, onEditar, onExcluir }: ListaDemandasProps) {
  if (demandas.length === 0) {
    return (
      <div className="lista-empty">
        <div className="lista-empty-icon">📋</div>
        <h3>Nenhuma demanda encontrada</h3>
        <p>Crie uma nova demanda para começar</p>
        <style>{`
          .lista-empty {
            text-align: center;
            padding: 80px 20px;
            background: var(--color-white);
            border-radius: var(--radius-lg);
            border: 2px dashed var(--color-border);
          }
          
          .lista-empty-icon {
            font-size: 4rem;
            margin-bottom: 16px;
          }
          
          .lista-empty h3 {
            font-family: var(--font-display);
            font-size: 1.5rem;
            color: var(--color-primary);
            margin-bottom: 8px;
          }
          
          .lista-empty p {
            color: var(--color-text-light);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="lista-container">
      <div className="lista-header">
        <div className="lista-col cliente">Cliente</div>
        <div className="lista-col marca">Marca</div>
        <div className="lista-col tipo">Tipo</div>
        <div className="lista-col status">Status</div>
        <div className="lista-col prioridade">Prioridade</div>
        <div className="lista-col data">Data</div>
        <div className="lista-col acoes">Ações</div>
      </div>

      <div className="lista-body">
        {demandas.map(demanda => {
          const diasAberto = Math.floor(
            (new Date().getTime() - new Date(demanda.dataCriacao).getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div key={demanda._id || demanda.id} className="lista-row">
              <div className="lista-col cliente">
                <div className="cliente-info">
                  <User size={16} />
                  <span>{demanda.nomeCliente}</span>
                </div>
              </div>

              <div className="lista-col marca">
                <div className="marca-info">
                  <Building2 size={16} />
                  <span>{demanda.marca}</span>
                </div>
              </div>

              <div className="lista-col tipo">
                <div className="tipo-info">
                  <AlertCircle size={16} />
                  <span>{TIPOS_PROBLEMA[demanda.tipoProblema]}</span>
                </div>
              </div>

              <div className="lista-col status">
                <span 
                  className="status-badge"
                  style={{ 
                    background: `${CORES_STATUS[demanda.status]}20`,
                    color: CORES_STATUS[demanda.status],
                    borderColor: CORES_STATUS[demanda.status]
                  }}
                >
                  {STATUS_SITUACAO[demanda.status]}
                </span>
              </div>

              <div className="lista-col prioridade">
                <span 
                  className="prioridade-badge"
                  style={{ background: CORES_PRIORIDADE[demanda.prioridade] }}
                >
                  {PRIORIDADES[demanda.prioridade]}
                </span>
              </div>

              <div className="lista-col data">
                <div className="data-info">
                  <Calendar size={14} />
                  <span>{new Date(demanda.dataContato).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className={`dias-badge ${diasAberto > 7 ? 'atrasado' : ''}`}>
                  <Clock size={12} />
                  {diasAberto} dias
                </div>
              </div>

              <div className="lista-col acoes">
                <button 
                  className="acao-btn editar" 
                  onClick={() => onEditar(demanda)}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="acao-btn excluir" 
                  onClick={() => onExcluir(demanda._id || demanda.id)}
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .lista-container {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
          overflow: hidden;
        }

        .lista-header {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr 1.2fr 100px 120px 100px;
          gap: 16px;
          padding: 16px 20px;
          background: var(--color-cream);
          border-bottom: 1px solid var(--color-border);
          font-weight: 600;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-light);
        }

        .lista-body {
          max-height: calc(100vh - 400px);
          overflow-y: auto;
        }

        .lista-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr 1.2fr 100px 120px 100px;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border);
          align-items: center;
          transition: background 0.2s;
        }

        .lista-row:hover {
          background: rgba(245, 240, 232, 0.5);
        }

        .lista-row:last-child {
          border-bottom: none;
        }

        .cliente-info, .marca-info, .tipo-info, .data-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text);
        }

        .cliente-info {
          font-weight: 600;
          color: var(--color-primary);
        }

        .tipo-info {
          font-size: 0.875rem;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid;
          white-space: nowrap;
        }

        .prioridade-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-align: center;
        }

        .data-info {
          font-size: 0.875rem;
          color: var(--color-text-light);
          margin-bottom: 4px;
        }

        .dias-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--color-text-light);
          background: var(--color-cream);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .dias-badge.atrasado {
          background: #fef2f2;
          color: var(--color-danger);
        }

        .acoes {
          display: flex;
          gap: 8px;
        }

        .acao-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .acao-btn.editar {
          background: rgba(15, 52, 96, 0.1);
          color: var(--color-accent);
        }

        .acao-btn.editar:hover {
          background: var(--color-accent);
          color: white;
        }

        .acao-btn.excluir {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
        }

        .acao-btn.excluir:hover {
          background: var(--color-danger);
          color: white;
        }

        @media (max-width: 1200px) {
          .lista-header,
          .lista-row {
            grid-template-columns: 1.5fr 1fr 1.5fr 1fr 90px 100px 80px;
          }
        }

        @media (max-width: 1024px) {
          .lista-header,
          .lista-row {
            grid-template-columns: 1fr 1fr 100px 80px;
          }
          
          .lista-col.tipo,
          .lista-col.marca {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .lista-header,
          .lista-row {
            grid-template-columns: 1fr 80px 60px;
          }
          
          .lista-col.prioridade,
          .lista-col.data {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
