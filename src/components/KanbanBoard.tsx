import { useState } from 'react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Demanda } from '../types';
import { COLUNAS_KANBAN, TIPOS_PROBLEMA, PRIORIDADES, CORES_PRIORIDADE } from '../types';
import { Calendar, User, Building2, AlertCircle, Clock, MoreVertical, Edit2, Trash2, GripVertical } from 'lucide-react';

interface KanbanBoardProps {
  demandas: Demanda[];
  onMoverDemanda: (id: string, novoStatus: Demanda['status']) => void;
  onEditar: (demanda: Demanda) => void;
  onExcluir: (id: string) => void;
}

interface KanbanCardProps {
  demanda: Demanda;
  onEditar: (demanda: Demanda) => void;
  onExcluir: (id: string) => void;
  isOverlay?: boolean;
}

function KanbanCard({ demanda, onEditar, onExcluir, isOverlay = false }: KanbanCardProps) {
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
    opacity: isDragging ? 0.5 : 1,
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
      <div className="card-header" {...attributes} {...listeners}>
        <div className="card-priority" style={{ background: CORES_PRIORIDADE[demanda.prioridade] }}>
          {PRIORIDADES[demanda.prioridade]}
        </div>
        <div className="card-menu-container">
          <button className="card-menu-btn" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={16} />
          </button>
          
          {showMenu && (
            <div className="card-menu">
              <button onClick={() => { onEditar(demanda); setShowMenu(false); }}>
                <Edit2 size={14} /> Editar
              </button>
              <button className="danger" onClick={() => { onExcluir(demanda._id || demanda.id); setShowMenu(false); }}>
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-content" onClick={() => onEditar(demanda)}>
        <h4 className="card-client">{demanda.nomeCliente}</h4>
        <div className="card-info">
          <span><Building2 size={12} /> {demanda.marca}</span>
          <span><AlertCircle size={12} /> {TIPOS_PROBLEMA[demanda.tipoProblema]}</span>
        </div>

        {demanda.encaminhadoPara && (
          <div className="card-assigned">
            <User size={12} />
            <span>{demanda.encaminhadoPara}</span>
          </div>
        )}

        {demanda.observacoes && (
          <div 
            className="card-observation rich-text-content" 
            dangerouslySetInnerHTML={{ __html: demanda.observacoes.substring(0, 100) + (demanda.observacoes.length > 100 ? '...' : '') }}
          />
        )}
      </div>

      <div className="card-footer">
        <div className="card-date">
          <Calendar size={12} />
          <span>{new Date(demanda.dataContato).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className={`card-days ${diasAberto > 7 ? 'warning' : ''}`}>
          <Clock size={12} />
          <span>{diasAberto}d</span>
        </div>
      </div>

      <div className="card-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
    </div>
  );
}

export function KanbanBoard({ demandas, onMoverDemanda, onEditar, onExcluir }: KanbanBoardProps) {
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
        {COLUNAS_KANBAN.map(coluna => {
          const demandasColuna = demandas.filter(d => d.status === coluna.id);
          
          return (
            <div key={coluna.id} className="kanban-column">
              <div className="column-header" style={{ borderTopColor: coluna.cor }}>
                <div className="column-title">
                  <span className="column-dot" style={{ background: coluna.cor }}></span>
                  <h3>{coluna.titulo}</h3>
                  <span className="column-count">{demandasColuna.length}</span>
                </div>
              </div>
              
              <SortableContext
                items={demandasColuna.map(d => d._id || d.id)}
                strategy={rectSortingStrategy}
              >
                <div className="column-content" data-status={coluna.id}>
                  {demandasColuna.map(demanda => (
                    <KanbanCard
                      key={demanda._id || demanda.id}
                      demanda={demanda}
                      onEditar={onEditar}
                      onExcluir={onExcluir}
                    />
                  ))}
                  
                  {demandasColuna.length === 0 && (
                    <div className="column-empty">
                      <p>Nenhuma demanda</p>
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
            isOverlay
          />
        ) : null}
      </DragOverlay>

      <style>{`
        .kanban-board {
          display: flex;
          gap: 12px;
          overflow-x: hidden;
          padding: 8px 0 24px;
          min-height: calc(100vh - 280px);
        }

        .kanban-column {
          flex: 1;
          min-width: 0;
          max-width: none;
          background: rgba(255, 255, 255, 0.5);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 280px);
        }

        .column-header {
          padding: 12px;
          border-top: 3px solid;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          background: var(--color-white);
          box-shadow: var(--shadow-sm);
        }

        .column-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .column-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .column-title h3 {
          font-family: var(--font-display);
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-text);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .column-count {
          background: var(--color-cream);
          color: var(--color-text);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .column-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .column-empty {
          text-align: center;
          padding: 24px 12px;
          color: var(--color-text-light);
          font-style: italic;
          font-size: 0.8125rem;
        }

        .kanban-card {
          background: var(--color-white);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
          cursor: grab;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .kanban-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .kanban-card.is-overlay {
          cursor: grabbing;
          box-shadow: var(--shadow-xl);
          transform: rotate(2deg) scale(1.02);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 8px 6px;
          cursor: grab;
        }

        .card-priority {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 6px;
          border-radius: 10px;
          color: white;
        }

        .card-menu-container {
          position: relative;
        }

        .card-menu-btn {
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          color: var(--color-text-light);
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .card-menu-btn:hover {
          background: var(--color-cream);
          color: var(--color-text);
        }

        .card-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 10;
          min-width: 100px;
          overflow: hidden;
        }

        .card-menu button {
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 0.8125rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }

        .card-menu button:hover {
          background: var(--color-cream);
        }

        .card-menu button.danger {
          color: var(--color-danger);
        }

        .card-menu button.danger:hover {
          background: #fef2f2;
        }

        .card-content {
          padding: 0 8px 8px;
          cursor: pointer;
        }

        .card-client {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-primary);
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          margin-bottom: 3px;
        }

        .card-info span {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.625rem;
          color: var(--color-text-light);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-assigned {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.625rem;
          color: var(--color-accent);
          background: rgba(15, 52, 96, 0.08);
          padding: 2px 4px;
          border-radius: var(--radius-sm);
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-observation {
          font-size: 0.625rem;
          color: var(--color-text-light);
          line-height: 1.3;
          max-height: 32px;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          background: var(--color-cream);
          border-top: 1px solid var(--color-border);
        }

        .card-date, .card-days {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.625rem;
          color: var(--color-text-light);
        }

        .card-days.warning {
          color: var(--color-danger);
          font-weight: 600;
        }

        .card-drag-handle {
          position: absolute;
          top: 50%;
          left: 2px;
          transform: translateY(-50%);
          opacity: 0;
          color: var(--color-text-light);
          cursor: grab;
          transition: opacity 0.2s;
        }

        .kanban-card:hover .card-drag-handle {
          opacity: 0.5;
        }

        .card-priority {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 10px;
          border-radius: 20px;
          color: white;
        }

        .card-menu-container {
          position: relative;
        }

        .card-menu-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--color-text-light);
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .card-menu-btn:hover {
          background: var(--color-cream);
          color: var(--color-text);
        }

        .card-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 10;
          min-width: 120px;
          overflow: hidden;
        }

        .card-menu button {
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .card-menu button:hover {
          background: var(--color-cream);
        }

        .card-menu button.danger {
          color: var(--color-danger);
        }

        .card-menu button.danger:hover {
          background: #fef2f2;
        }

        .card-content {
          padding: 0 12px 12px;
          cursor: pointer;
        }

        .card-client {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-primary);
          margin-bottom: 8px;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }

        .card-info span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: var(--color-text-light);
        }

        .card-assigned {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: var(--color-accent);
          background: rgba(15, 52, 96, 0.08);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          margin-bottom: 8px;
        }

        .card-observation {
          font-size: 0.8125rem;
          color: var(--color-text-light);
          line-height: 1.5;
          max-height: 60px;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: var(--color-cream);
          border-top: 1px solid var(--color-border);
        }

        .card-date, .card-days {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--color-text-light);
        }

        .card-days.warning {
          color: var(--color-danger);
          font-weight: 600;
        }

        .card-drag-handle {
          position: absolute;
          top: 50%;
          left: 4px;
          transform: translateY(-50%);
          opacity: 0;
          color: var(--color-text-light);
          cursor: grab;
          transition: opacity 0.2s;
        }

        .kanban-card:hover .card-drag-handle {
          opacity: 0.5;
        }

        @media (max-width: 1400px) {
          .column-title h3 {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 1200px) {
          .kanban-board {
            gap: 8px;
          }
          
          .column-header {
            padding: 10px 8px;
          }
          
          .column-content {
            padding: 6px;
          }
        }

        @media (max-width: 1024px) {
          .kanban-board {
            overflow-x: auto;
            gap: 12px;
          }
          
          .kanban-column {
            min-width: 260px;
            flex: 0 0 260px;
          }
        }
      `}</style>
    </DndContext>
  );
}
