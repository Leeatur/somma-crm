import { STATUS_SITUACAO } from '../types';
import { Search, Filter, Plus, LayoutGrid, List, CheckCircle2, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

interface DashboardProps {
  estatisticas: {
    total: number;
    pendentes: number;
    resolvidos: number;
    urgentes: number;
    altaPrioridade: number;
    taxaResolucao: number;
  };
  busca: string;
  setBusca: (valor: string) => void;
  filtroStatus: string;
  setFiltroStatus: (valor: string) => void;
  visualizacao: 'kanban' | 'lista';
  setVisualizacao: (tipo: 'kanban' | 'lista') => void;
  onNovaDemanda: () => void;
}

export function Dashboard({
  estatisticas,
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  visualizacao,
  setVisualizacao,
  onNovaDemanda,
}: DashboardProps) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div className="brand-text">
            <h1>SOMMA</h1>
            <p>Gestão de Demandas</p>
          </div>
        </div>

        <button className="btn-nova-demanda" onClick={onNovaDemanda}>
          <Plus size={20} />
          Nova Demanda
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><BarChart3 size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{estatisticas.total}</span>
            <span className="stat-label">Total de Demandas</span>
          </div>
        </div>

        <div className="stat-card pendentes">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{estatisticas.pendentes}</span>
            <span className="stat-label">Pendentes</span>
          </div>
        </div>

        <div className="stat-card resolvidos">
          <div className="stat-icon"><CheckCircle2 size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{estatisticas.resolvidos}</span>
            <span className="stat-label">Resolvidos</span>
          </div>
          <div className="stat-percentage">{estatisticas.taxaResolucao}%</div>
        </div>

        <div className="stat-card urgentes">
          <div className="stat-icon"><AlertTriangle size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{estatisticas.urgentes + estatisticas.altaPrioridade}</span>
            <span className="stat-label">Urgentes/Alta</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente, marca, responsável..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-select">
            <Filter size={16} />
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="todos">Todos os Status</option>
              {Object.entries(STATUS_SITUACAO).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={visualizacao === 'kanban' ? 'active' : ''}
              onClick={() => setVisualizacao('kanban')}
              title="Visualização Kanban"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={visualizacao === 'lista' ? 'active' : ''}
              onClick={() => setVisualizacao('lista')}
              title="Visualização em Lista"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 24px 32px;
          max-width: 1800px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand-logo {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--color-gold) 0%, #d4af37 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }

        .brand-text h1 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0;
          letter-spacing: 2px;
        }

        .brand-text p {
          color: var(--color-text-light);
          font-size: 0.9375rem;
          margin: 2px 0 0;
        }

        .btn-nova-demanda {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-highlight) 100%);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: var(--shadow-md);
        }

        .btn-nova-demanda:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }

        .stat-card.total::before { background: var(--color-accent); }
        .stat-card.pendentes::before { background: var(--color-warning); }
        .stat-card.resolvidos::before { background: var(--color-success); }
        .stat-card.urgentes::before { background: var(--color-danger); }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card.total .stat-icon { background: rgba(15, 52, 96, 0.1); color: var(--color-accent); }
        .stat-card.pendentes .stat-icon { background: rgba(245, 158, 11, 0.1); color: var(--color-warning); }
        .stat-card.resolvidos .stat-icon { background: rgba(16, 185, 129, 0.1); color: var(--color-success); }
        .stat-card.urgentes .stat-icon { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-light);
          margin-top: 4px;
        }

        .stat-percentage {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--color-success);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: var(--color-white);
          padding: 16px 20px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
          margin-bottom: 20px;
        }

        .search-box {
          flex: 1;
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--color-cream);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .search-box:focus-within {
          border-color: var(--color-accent);
          background: var(--color-white);
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          font-family: var(--font-body);
          font-size: 0.9375rem;
          color: var(--color-text);
        }

        .search-box input:focus {
          outline: none;
        }

        .search-box input::placeholder {
          color: var(--color-text-light);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-select {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-cream);
          padding: 10px 14px;
          border-radius: var(--radius-md);
        }

        .filter-select select {
          background: none;
          border: none;
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-text);
          cursor: pointer;
        }

        .filter-select select:focus {
          outline: none;
        }

        .view-toggle {
          display: flex;
          background: var(--color-cream);
          border-radius: var(--radius-md);
          padding: 4px;
        }

        .view-toggle button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-text-light);
          transition: all 0.2s;
        }

        .view-toggle button.active {
          background: var(--color-white);
          color: var(--color-accent);
          box-shadow: var(--shadow-sm);
        }

        .view-toggle button:hover:not(.active) {
          color: var(--color-text);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            max-width: none;
          }
          
          .filter-group {
            justify-content: space-between;
          }
        }

        @media (max-width: 640px) {
          .dashboard {
            padding: 16px;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-group {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
