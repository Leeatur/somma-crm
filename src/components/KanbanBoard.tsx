import { useState } from 'react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Demanda } from '../types';
import { COLUNAS_KANBAN, TIPOS_PROBLEMA, PRIORIDADES, CORES_PRIORIDADE } from '../types';
import { Calendar, User, Building2, AlertCircle, Clock, MoreVertical, Edit2, Trash2, GripVertical, FolderOpen } from 'lucide-react';

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
      {/* Drag handle strip */}
      <div className="card-drag-strip" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>

      <div className="card-body">
        {/* Header row: priority badge + menu */}
        <div className="card-toprow">
          <span
            className="card-priority-badge"
            style={{ background: CORES_PRIORIDADE[demanda.prioridade] }}
          >
            {PRIORIDADES[demanda.prioridade]}
          </span>

          <div className="card-menu-wrap">
            <button
              className="card-menu-trigger"
              onClick={e => { e.stopPropagation(); setShowMenu(s => !s); }}
            >
              <MoreVertical size={14} />
            </button>
            {showMenu && (
              <div className="card-menu">
                <button onClick={() => { onVerFichario(demanda); setShowMenu(false); }}>
                  <FolderOpen size={13} /> Ver Fichário
                </button>
                <button onClick={() => { onEditar(demanda); setShowMenu(false); }}>
                  <Edit2 size={13} /> Editar
                </button>
                <button
                  className="danger"
                  onClick={() => { onExcluir(demanda._id || demanda.id); setShowMenu(false); }}
                >
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="card-main" onClick={() => onEditar(demanda)}>
          <h4 className="card-client">{demanda.nomeCliente}</h4>

          <div className="card-meta">
            <span className="card-meta-item">
              <Building2 size={11} /> {demanda.marca}
            </span>
            <span className="card-meta-item">
              <AlertCircle size={11} /> {TIPOS_PROBLEMA[demanda.tipoProblema]}
            </span>
          </div>

          {demanda.encaminhadoPara && (
            <div className="card-assigned">
              <User size={11} />
              <span>{demanda.encaminhadoPara}</span>
            </div>
          )}

          {demanda.observacoes && !demanda.observacoes.startsWith('[') && (
            <div
              className="card-obs rich-text-content"
              dangerouslySetInnerHTML={{
                __html: demanda.observacoes.substring(0, 90) +
                  (demanda.observacoes.length > 90 ? '…' : ''),
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="card-footer">
          <span className="card-date">
            <Calendar size={11} />
            {new Date(demanda.dataContato).toLocaleDateString('pt-BR')}
          </span>
          <span className={`card-age ${diasAberto > 7 ? 'overdue' : ''}`}>
            <Clock size={11} />
            {diasAberto}d
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
        /* ── Board ── */
        .kanban-board {
          display: flex;
          gap: 10px;
          overflow-x: hidden;
          padding: 4px 0 28px;
          min-height: calc(100vh - 290px);
          align-items: flex-start;
        }

        /* ── Column ── */
        .kanban-column {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(6px);
          border: 1px solid var(--color-border-light);
          max-height: calc(100vh - 290px);
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
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 7px;
          scrollbar-width: thin;
        }

        .column-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 12px;
          color: var(--color-text-muted);
          font-size: 0.75rem;
          font-style: italic;
          border: 1.5px dashed var(--color-border);
          border-radius: var(--radius-md);
          margin: 4px;
        }

        /* ── Kanban Card ── */
        .kanban-card {
          background: var(--color-white);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow-xs);
          cursor: default;
          transition: var(--transition-smooth);
          position: relative;
          display: flex;
          overflow: hidden;
        }

        .kanban-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
          border-color: var(--color-border);
        }

        .kanban-card.is-overlay {
          cursor: grabbing;
          box-shadow: var(--shadow-xl);
          transform: rotate(1.5deg) scale(1.03);
        }

        /* Drag strip */
        .card-drag-strip {
          width: 18px;
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

        .kanban-card:hover .card-drag-strip {
          opacity: 1;
        }

        .card-drag-strip:active {
          cursor: grabbing;
        }

        /* Card body */
        .card-body {
          flex: 1;
          min-width: 0;
          padding: 10px 10px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .card-toprow {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-priority-badge {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          color: white;
          flex-shrink: 0;
        }

        /* Card menu */
        .card-menu-wrap { position: relative; }

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

        .card-menu-trigger:hover {
          background: var(--color-cream);
          color: var(--color-text);
        }

        .card-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 20;
          min-width: 118px;
          overflow: hidden;
          animation: scaleIn 0.15s ease-out;
          transform-origin: top right;
        }

        .card-menu button {
          width: 100%;
          padding: 9px 13px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 0.8125rem;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          gap: 7px;
          transition: background 0.15s;
          color: var(--color-text);
        }

        .card-menu button:hover { background: var(--color-cream); }
        .card-menu button.danger { color: var(--color-danger); }
        .card-menu button.danger:hover { background: #fff1f2; }

        /* Card main (clickable) */
        .card-main { cursor: pointer; }

        .card-client {
          font-family: var(--font-display);
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-primary);
          line-height: 1.3;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 5px;
        }

        .card-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.6875rem;
          color: var(--color-text-light);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-assigned {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.6875rem;
          color: var(--color-accent);
          background: rgba(13, 46, 88, 0.07);
          padding: 3px 7px;
          border-radius: var(--radius-sm);
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .card-obs {
          font-size: 0.6875rem;
          color: var(--color-text-muted);
          line-height: 1.4;
          max-height: 36px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        /* Card footer */
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 0 8px;
          border-top: 1px solid var(--color-border-light);
          margin-top: auto;
        }

        .card-date, .card-age {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.6875rem;
          color: var(--color-text-muted);
        }

        .card-age.overdue {
          color: var(--color-danger);
          font-weight: 600;
        }

        /* ── Responsive ── */
        @media (max-width: 1400px) {
          .column-title-text { font-size: 0.6875rem; }
        }

        @media (max-width: 1100px) {
          .kanban-board { gap: 7px; }
          .column-header { padding: 10px 10px; }
          .column-cards { padding: 6px; gap: 6px; }
        }

        @media (max-width: 900px) {
          .kanban-board {
            overflow-x: auto;
            gap: 10px;
          }
          .kanban-column {
            min-width: 240px;
            flex: 0 0 240px;
          }
        }
      `}</style>
    </DndContext>
  );
}
