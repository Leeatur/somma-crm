import { useState } from 'react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Demanda } from '../types';
import { COLUNAS_KANBAN, CORES_PRIORIDADE } from '../types';
import { Clock, MoreVertical, Edit2, Trash2, GripVertical, FolderOpen, Building2, User } from 'lucide-react';

interface KanbanBoardProps {
  demandas: Demanda[];
  onMoverDemanda: (id: string, novoStatus: Demanda['status']) => void;
  onEditar: (demanda: Demanda) => void;
  onExcluir: (id: string) => void;
  onVerFichario: (demanda: Demanda) => void;
}

interface KanbanCardProps {
  demanda: Demanda;
  onEditar: (demanda: Demanda) => void;
  onExcluir: (id: string) => void;
  onVerFichario: (demanda: Demanda) => void;
  isOverlay?: boolean;
}

function KanbanCard({ demanda, onEditar, onExcluir, onVerFichario, isOverlay = false }: KanbanCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: demanda._id || demanda.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const diasAberto = Math.floor(
    (new Date().getTime() - new Date(demanda.dataCriacao).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isOverlay ? 'is-overlay' : ''}`}
    >
      {/* Drag handle */}
      <div className="card-drag-strip" {...attributes} {...listeners}>
        <GripVertical size={12} />
      </div>

      {/* Clique no corpo abre Fichário */}
      <div className="card-body" onClick={() => onVerFichario(demanda)}>

        <div className="card-toprow">
          <span className="card-priority-dot" style={{ background: CORES_PRIORIDADE[demanda.prioridade] }} />
          <h4 className="card-client">{demanda.nomeCliente}</h4>

          <div className="card-menu-wrap" onClick={e => e.stopPropagation()}>
            <button className="card-menu-trigger" onClick={() => setShowMenu(s => !s)}>
              <MoreVertical size={13} />
            </button>
            {showMenu && (
              <div className="card-menu">
                <button onClick={() => { onVerFichario(demanda); setShowMenu(false); }}>
                  <FolderOpen size={13} /> Ver Fichário
                </button>
                <button onClick={() => { onEditar(demanda); setShowMenu(false); }}>
                  <Edit2 size={13} /> Editar
                </button>
                <button className="danger" onClick={() => { onExcluir(demanda._id || demanda.id); setShowMenu(false); }}>
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card-info-row">
          {demanda.cnpj && <span className="card-cnpj">{demanda.cnpj}</span>}
        </div>

        <div className="card-footer-row">
          <span className="card-tag"><Building2 size={10} />{demanda.marca}</span>
          {(demanda as any).representante && (
            <span className="card-tag"><User size={10} />{(demanda as any).representante}</span>
          )}
          <span className={`card-age-badge ${diasAberto > 7 ? 'overdue' : ''}`}>
            <Clock size={10} />{diasAberto}d
          </span>
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ demandas, onMoverDemanda, onEditar, onExcluir, onVerFichario }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const overId = over.id as string;
    if (COLUNAS_KANBAN.some(col => col.id === overId)) {
      onMoverDemanda(active.id as string, overId as Demanda['status']);
    }
  };

  const activeDemanda = activeId ? demandas.find(d => (d._id || d.id) === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {COLUNAS_KANBAN.map((coluna, idx) => {
          const demandasColuna = demandas.filter(d => d.status === coluna.id);

          return (
            <div
              key={coluna.id}
              className="kanban-column"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="column-header" style={{ '--col-color': coluna.cor } as React.CSSProperties}>
                <span className="column-dot" style={{ background: coluna.cor }} />
                <h3 className="column-title-text">{coluna.titulo}</h3>
                <span className="column-badge">{demandasColuna.length}</span>
              </div>

              <SortableContext
                items={demandasColuna.map(d => d._id || d.id)}
                strategy={rectSortingStrategy}
              >
                <div className="column-cards" data-status={coluna.id}>
                  {demandasColuna.map(demanda => (
                    <KanbanCard
                      key={demanda._id || demanda.id}
                      demanda={demanda}
                      onEditar={onEditar}
                      onExcluir={onExcluir}
                      onVerFichario={onVerFichario}
                    />
                  ))}

                  {demandasColuna.length === 0 && (
                    <div className="column-empty">
                      <span>Nenhuma demanda</span>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeDemanda ? (
          <KanbanCard
            demanda={activeDemanda}
            onEditar={() => {}}
            onExcluir={() => {}}
            onVerFichario={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>

      <style>{`
        /* ── Board: scroll horizontal, colunas crescem verticalmente ── */
        .kanban-board {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px 4px 40px;
          align-items: flex-start;
          scrollbar-width: thin;
          scrollbar-color: var(--color-border) transparent;
        }

        .kanban-board::-webkit-scrollbar { height: 6px; }
        .kanban-board::-webkit-scrollbar-track { background: transparent; }
        .kanban-board::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 99px; }

        /* ── Column: sem altura máxima, cresce com os cards ── */
        .kanban-column {
          flex: 0 0 260px;
          width: 260px;
          min-width: 260px;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(6px);
          border: 1px solid var(--color-border-light);
          animation: fadeIn 0.4s ease-out both;
          transition: var(--transition-smooth);
        }

        .kanban-column:hover {
          background: rgba(255,255,255,0.65);
        }

        /* ── Column Header ── */
        .column-header {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px 14px;
          border-bottom: 1px solid var(--color-border-light);
          background: var(--color-white);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          position: relative;
          overflow: hidden;
        }

        .column-header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2.5px;
          background: var(--col-color, var(--color-gold));
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        .column-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 6px currentColor;
          margin-top: 3px;
        }

        .column-title-text {
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-text);
          flex: 1;
          white-space: normal;
          overflow: visible;
          word-break: break-word;
          line-height: 1.25;
          letter-spacing: 0.01em;
          text-transform: uppercase;
        }

        .column-badge {
          background: var(--color-cream);
          color: var(--color-text-light);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.6875rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* ── Cards container ── */
        .column-cards {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .column-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 12px;
          color: var(--color-text-muted);
          font-size: 0.75rem;
          font-style: italic;
          border: 1.5px dashed var(--color-border);
          border-radius: var(--radius-md);
          margin: 4px;
        }

        /* ── Kanban Card compacto ── */
        .kanban-card {
          background: var(--color-white);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow-xs);
          transition: var(--transition-smooth);
          display: flex;
          overflow: hidden;
        }

        .kanban-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
          border-color: var(--color-gold);
        }

        .kanban-card.is-overlay {
          box-shadow: var(--shadow-xl);
          transform: rotate(1.5deg) scale(1.03);
        }

        /* Drag strip */
        .card-drag-strip {
          width: 14px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          color: var(--color-text-muted);
          background: var(--color-cream);
          border-right: 1px solid var(--color-border-light);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .kanban-card:hover .card-drag-strip { opacity: 1; }
        .card-drag-strip:active { cursor: grabbing; }

        /* Card body — clicável */
        .card-body {
          flex: 1;
          min-width: 0;
          padding: 9px 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
        }

        /* Top row: dot + nome + menu */
        .card-toprow {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-priority-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .card-client {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-primary);
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Card menu */
        .card-menu-wrap { position: relative; flex-shrink: 0; }

        .card-menu-trigger {
          background: none;
          border: none;
          padding: 3px;
          cursor: pointer;
          color: var(--color-text-muted);
          border-radius: var(--radius-xs);
          display: flex;
          transition: var(--transition-fast);
        }
        .card-menu-trigger:hover { background: var(--color-cream); color: var(--color-text); }

        .card-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 20;
          min-width: 130px;
          overflow: hidden;
          animation: scaleIn 0.15s ease-out;
          transform-origin: top right;
        }
        .card-menu button {
          width: 100%; padding: 9px 13px;
          background: none; border: none; text-align: left;
          cursor: pointer; font-size: 0.8125rem; font-family: var(--font-body);
          display: flex; align-items: center; gap: 7px;
          transition: background 0.15s; color: var(--color-text);
        }
        .card-menu button:hover { background: var(--color-cream); }
        .card-menu button.danger { color: var(--color-danger); }
        .card-menu button.danger:hover { background: #fff1f2; }

        /* CNPJ */
        .card-info-row { min-height: 0; }
        .card-cnpj {
          font-size: 0.6875rem;
          color: var(--color-text-muted);
          letter-spacing: 0.03em;
        }

        /* Footer row com tags */
        .card-footer-row {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .card-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 0.6rem;
          color: var(--color-text-light);
          background: var(--color-cream);
          padding: 2px 6px;
          border-radius: 99px;
          white-space: nowrap;
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-age-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 0.6rem;
          padding: 2px 6px;
          border-radius: 99px;
          background: var(--color-cream);
          color: var(--color-text-muted);
          margin-left: auto;
        }

        .card-age-badge.overdue {
          background: #fee2e2;
          color: var(--color-danger);
          font-weight: 700;
        }

        /* Card footer — remover referências antigas */
        .card-footer, .card-date, .card-age { display: none;
          margin-bottom: 4px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .kanban-column { flex: 0 0 220px; width: 220px; min-width: 220px; }
        }
      `}</style>
    </DndContext>
  );
}
