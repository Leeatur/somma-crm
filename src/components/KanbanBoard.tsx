import { useState } from 'react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Demanda } from '../types';
import { COLUNAS_KANBAN, CORES_PRIORIDADE } from '../types';
import { Clock, Building2, User, GripVertical } from 'lucide-react';

interface KanbanBoardProps {
  demandas: Demanda[];
  onMoverDemanda: (id: string, novoStatus: Demanda['status']) => void;
  onVerFichario: (demanda: Demanda) => void;
}

interface KanbanCardProps {
  demanda: Demanda;
  onVerFichario: (demanda: Demanda) => void;
  isOverlay?: boolean;
}

const PRIORIDADE_LABEL: Record<string, string> = {
  urgente: 'URG', alta: 'ALTA', media: 'MED', baixa: 'BAIXA',
};

function KanbanCard({ demanda, onVerFichario, isOverlay = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: demanda._id || demanda.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 };
  const rawData = demanda.dataCriacao || demanda.createdAt;
  const diasAberto = rawData ? Math.floor((Date.now() - new Date(rawData).getTime()) / 86400000) : null;
  const priorCor = CORES_PRIORIDADE[demanda.prioridade] ?? '#6b7280';
  const isUrgente = demanda.prioridade === 'urgente';
  const isAlta    = demanda.prioridade === 'alta';

  return (
    <div ref={setNodeRef} style={style}
      className={`kcard ${isOverlay ? 'kcard--overlay' : ''} ${isUrgente ? 'kcard--urgente' : ''}`}
      onClick={() => onVerFichario(demanda)}
    >
      <div className="kcard-priority-bar" style={{ background: priorCor }} />
      <div className="kcard-drag" {...attributes} {...listeners} onClick={e => e.stopPropagation()}>
        <GripVertical size={11} />
      </div>
      <div className="kcard-content">
        <div className="kcard-row kcard-row--top">
          <span className="kcard-nome">{demanda.nomeCliente}</span>
          <div className="kcard-badges">
            {(isUrgente || isAlta) && (
              <span className="kcard-prio-badge" style={{ background: priorCor + '22', color: priorCor, borderColor: priorCor + '55' }}>
                {PRIORIDADE_LABEL[demanda.prioridade]}
              </span>
            )}
            {diasAberto !== null && (
              <span className={`kcard-dias ${diasAberto > 14 ? 'kcard-dias--vencido' : diasAberto > 7 ? 'kcard-dias--alerta' : ''}`}>
                <Clock size={9} />{diasAberto}d
              </span>
            )}
          </div>
        </div>
        {demanda.cnpj && <span className="kcard-cnpj">{demanda.cnpj}</span>}
        <div className="kcard-tags">
          {demanda.marca && <span className="kcard-tag kcard-tag--marca"><Building2 size={9} />{demanda.marca}</span>}
          {(demanda as any).representante && <span className="kcard-tag kcard-tag--rep"><User size={9} />{(demanda as any).representante}</span>}
          {demanda.valor && <span className="kcard-tag kcard-tag--valor">R${demanda.valor}</span>}
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ demandas, onMoverDemanda, onVerFichario }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 250, tolerance: 5 } })
  );
  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd   = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    if (COLUNAS_KANBAN.some(c => c.id === (over.id as string)))
      onMoverDemanda(active.id as string, over.id as Demanda['status']);
  };
  const activeDemanda = activeId ? demandas.find(d => (d._id || d.id) === activeId) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="kboard">
        {COLUNAS_KANBAN.map((col, idx) => {
          const lista = demandas.filter(d => d.status === col.id);
          return (
            <div key={col.id} className="kcol"
              style={{ animationDelay: `${idx * 0.04}s`, '--kcol-cor': col.cor } as React.CSSProperties}
            >
              <div className="kcol-header">
                <div className="kcol-stripe" style={{ background: col.cor }} />
                <span className="kcol-dot" style={{ background: col.cor }} />
                <span className="kcol-titulo">{col.titulo}</span>
                <span className="kcol-count">{lista.length}</span>
              </div>
              <SortableContext items={lista.map(d => d._id || d.id)} strategy={rectSortingStrategy}>
                <div className="kcol-cards" data-status={col.id}>
                  {lista.map(d => (
                    <KanbanCard key={d._id || d.id} demanda={d} onVerFichario={onVerFichario} />
                  ))}
                  {lista.length === 0 && <div className="kcol-empty">Nenhuma demanda</div>}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeDemanda && <KanbanCard demanda={activeDemanda} onVerFichario={() => {}} isOverlay />}
      </DragOverlay>

      <style>{`
        .kboard {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          padding: 2px 2px 28px;
          align-items: start;
        }
        .kcol {
          min-width: 0; display: flex; flex-direction: column;
          border-radius: 14px;
          background: rgba(255,255,255,0.58);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.85);
          box-shadow: 0 2px 12px rgba(11,31,58,0.07);
          animation: slideInUp 0.4s ease-out both;
          transition: var(--transition-smooth);
        }
        .kcol:hover { background: rgba(255,255,255,0.76); }

        .kcol-header {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 11px 9px;
          border-bottom: 1px solid var(--color-border-light);
          background: rgba(255,255,255,0.9);
          border-radius: 14px 14px 0 0;
          position: relative; overflow: hidden;
        }
        .kcol-stripe { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 14px 14px 0 0; }
        .kcol-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 5px currentColor; margin-top: 1px; }
        .kcol-titulo {
          flex: 1; font-size: 0.58rem; font-weight: 700; color: var(--color-primary);
          text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.25; word-break: break-word;
        }
        .kcol-count {
          background: var(--color-cream); color: var(--color-text-light);
          font-size: 0.62rem; font-weight: 800; padding: 1px 7px;
          border-radius: 99px; flex-shrink: 0; border: 1px solid var(--color-border-light);
        }
        .kcol-cards { padding: 6px 5px; display: flex; flex-direction: column; gap: 5px; }
        .kcol-empty {
          margin: 4px; padding: 14px 6px; text-align: center;
          color: var(--color-text-muted); font-size: 0.66rem; font-style: italic;
          border: 1.5px dashed var(--color-border); border-radius: 9px;
        }

        /* ── Card ── */
        .kcard {
          background: var(--color-white); border-radius: 9px;
          border: 1px solid var(--color-border-light);
          box-shadow: 0 1px 4px rgba(11,31,58,0.06);
          display: flex; overflow: hidden; cursor: pointer;
          transition: var(--transition-smooth);
        }
        .kcard:hover {
          box-shadow: 0 4px 16px rgba(11,31,58,0.13);
          transform: translateY(-1px); border-color: var(--color-gold);
        }
        .kcard--overlay { box-shadow: 0 12px 40px rgba(11,31,58,0.22); transform: rotate(1.5deg) scale(1.03); }
        .kcard--urgente { animation: pulse-urgente 2.2s ease-in-out infinite; }
        @keyframes pulse-urgente {
          0%,100% { box-shadow: 0 1px 4px rgba(11,31,58,0.06); }
          50% { box-shadow: 0 2px 14px rgba(220,38,38,0.22); }
        }
        .kcard-priority-bar { width: 4px; flex-shrink: 0; }
        .kcard-drag {
          width: 13px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          cursor: grab; color: var(--color-text-muted); opacity: 0; transition: opacity 0.18s;
          background: var(--color-cream); border-right: 1px solid var(--color-border-light);
        }
        .kcard:hover .kcard-drag { opacity: 1; }
        .kcard-drag:active { cursor: grabbing; }
        .kcard-content {
          flex: 1; min-width: 0; padding: 8px 8px 6px;
          display: flex; flex-direction: column; gap: 3px;
        }
        .kcard-row { display: flex; align-items: flex-start; gap: 4px; }
        .kcard-row--top { justify-content: space-between; }
        .kcard-nome {
          font-size: 0.75rem; font-weight: 700; color: var(--color-primary);
          line-height: 1.2; flex: 1; min-width: 0;
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .kcard-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; margin-left: 3px; }
        .kcard-prio-badge {
          font-size: 0.52rem; font-weight: 800; padding: 1px 4px;
          border-radius: 4px; border: 1px solid; letter-spacing: 0.03em; white-space: nowrap;
        }
        .kcard-dias {
          display: inline-flex; align-items: center; gap: 2px;
          font-size: 0.58rem; font-weight: 700; padding: 1px 5px;
          border-radius: 99px; background: var(--color-cream); color: var(--color-text-muted);
        }
        .kcard-dias--alerta  { background: #fef3c7; color: #92400e; }
        .kcard-dias--vencido { background: #fee2e2; color: #dc2626; font-weight: 800; }
        .kcard-cnpj { font-size: 0.59rem; color: var(--color-text-muted); letter-spacing: 0.03em; }
        .kcard-tags { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 1px; }
        .kcard-tag {
          display: inline-flex; align-items: center; gap: 2px;
          font-size: 0.57rem; font-weight: 600; padding: 2px 5px; border-radius: 5px;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .kcard-tag--marca { background: #eff6ff; color: #1e40af; }
        .kcard-tag--rep   { background: #f5f3ff; color: #6d28d9; }
        .kcard-tag--valor { background: #f0fdf4; color: #15803d; font-weight: 700; }

        @media (max-width: 1100px) { .kboard { grid-template-columns: repeat(4,1fr); } }
        @media (max-width: 768px)  { .kboard { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 480px)  { .kboard { grid-template-columns: 1fr; } }
      `}</style>
    </DndContext>
  );
}
