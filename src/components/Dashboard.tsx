import { STATUS_SITUACAO } from '../types';
import { Search, Filter, Plus, LayoutGrid, List, CheckCircle2, Clock, AlertTriangle, BarChart3, Users, LogOut, FileText } from 'lucide-react';

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
  onRelatorio: () => void;
  nomeUsuario: string;
  statusConexao: 'conectando' | 'online' | 'offline';
  onLogout: () => void;
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
  onRelatorio,
  nomeUsuario,
  statusConexao,
  onLogout,
}: DashboardProps) {
  return (
    <div className="dashboard">
      {/* ── Top Bar ── */}
      <div className="dashboard-topbar">
        <div className="brand">
          <div className="brand-emblem">
            <span>S</span>
          </div>
          <div className="brand-text">
            <h1>SOMMA</h1>
            <p>Gestão de Demandas</p>
          </div>
        </div>

        <div className="topbar-right">
          <div className={`status-indicator ${statusConexao}`}>
            {statusConexao === 'online'     && '🟢 Online'}
            {statusConexao === 'offline'    && '🔴 Offline'}
            {statusConexao === 'conectando' && '🟡 Conectando...'}
          </div>
          <button className="user-btn" onClick={onLogout} title="Sair">
            <Users size={14} />
            {nomeUsuario}
            <LogOut size={13} style={{ opacity: 0.7 }} />
          </button>
          <button className="btn-relatorio" onClick={onRelatorio} title="Ver Relatório">
            <FileText size={16} />
            <span className="btn-rel-text">Relatório</span>
          </button>
          <button className="btn-nova-demanda" onClick={onNovaDemanda}>
            <span className="btn-nova-inner">
              <Plus size={18} strokeWidth={2.5} />
              <span className="btn-nova-text">Nova Demanda</span>
            </span>
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <div
          className={`stat-card stat-total${filtroStatus === 'todos' ? ' stat-card--active' : ''}`}
          onClick={() => setFiltroStatus('todos')}
          title="Mostrar todas as demandas"
        >
          <div className="stat-icon-wrap">
            <BarChart3 size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-number">{estatisticas.total}</span>
            <span className="stat-label">Total de Demandas</span>
          </div>
          <div className="stat-glow stat-glow--blue" />
        </div>

        <div
          className={`stat-card stat-pendentes${filtroStatus === 'em_andamento' ? ' stat-card--active' : ''}`}
          onClick={() => setFiltroStatus('em_andamento')}
          title="Filtrar em andamento"
        >
          <div className="stat-icon-wrap">
            <Clock size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-number">{estatisticas.pendentes}</span>
            <span className="stat-label">Em Andamento</span>
          </div>
          <div className="stat-glow stat-glow--amber" />
        </div>

        <div
          className={`stat-card stat-resolvidos${filtroStatus === 'resolvido_finalizado' ? ' stat-card--active' : ''}`}
          onClick={() => setFiltroStatus('resolvido_finalizado')}
          title="Filtrar resolvidos"
        >
          <div className="stat-icon-wrap">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-number">{estatisticas.resolvidos}</span>
            <span className="stat-label">Resolvidos</span>
          </div>
          <span className="stat-rate">{estatisticas.taxaResolucao}%</span>
          <div className="stat-glow stat-glow--green" />
        </div>

        <div
          className={`stat-card stat-urgentes${filtroStatus === 'prioridade:urgente' ? ' stat-card--active' : ''}`}
          onClick={() => setFiltroStatus('prioridade:urgente')}
          title="Filtrar urgentes"
        >
          <div className="stat-icon-wrap">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-number">{estatisticas.urgentes + estatisticas.altaPrioridade}</span>
            <span className="stat-label">Urgentes / Alta</span>
          </div>
          <div className="stat-glow stat-glow--red" />
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar cliente, marca, responsável…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        <div className="filter-right">
          <div className="filter-select-wrap">
            <Filter size={14} />
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
              title="Kanban"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={visualizacao === 'lista' ? 'active' : ''}
              onClick={() => setVisualizacao('lista')}
              title="Lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Layout ── */
        .dashboard {
          padding: 28px 36px 0;
          max-width: 1900px;
          margin: 0 auto;
        }

        /* ── Top Bar ── */
        .dashboard-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          animation: fadeIn 0.45s ease-out;
          gap: 12px;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .status-indicator {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--color-white);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
          white-space: nowrap;
        }

        .status-indicator.online {
          color: var(--color-success);
        }

        .status-indicator.offline {
          color: var(--color-danger);
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--color-accent);
          color: var(--color-white);
          border: none;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-btn:hover {
          background: var(--color-highlight);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .brand-emblem {
          position: relative;
          width: 54px;
          height: 54px;
          background: linear-gradient(145deg, var(--color-gold) 0%, #b8891d 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-gold), inset 0 1px 0 rgba(255,255,255,0.2);
          animation: pulse-ring 3s ease-in-out infinite;
        }

        .brand-emblem span {
          font-family: var(--font-display);
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--color-primary);
          letter-spacing: -1px;
          line-height: 1;
        }

        .brand-text h1 {
          font-family: var(--font-display);
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--color-primary);
          letter-spacing: 0.12em;
          line-height: 1;
        }

        .brand-text p {
          color: var(--color-text-light);
          font-size: 0.875rem;
          font-weight: 400;
          margin-top: 3px;
          letter-spacing: 0.02em;
        }

        /* ── Relatório button ── */
        .btn-relatorio {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 16px;
          background: var(--color-white);
          color: var(--color-primary);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
          white-space: nowrap;
          box-shadow: var(--shadow-xs);
        }

        .btn-relatorio:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
          box-shadow: 0 0 0 3px var(--color-gold-dim);
        }

        /* ── Nova Demanda button ── */
        .btn-nova-demanda {
          background: linear-gradient(135deg, var(--color-gold) 0%, #b8891d 100%);
          border: none;
          border-radius: var(--radius-md);
          padding: 0;
          cursor: pointer;
          box-shadow: var(--shadow-gold);
          transition: var(--transition-spring);
          position: relative;
          overflow: hidden;
        }

        .btn-nova-demanda::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
          pointer-events: none;
        }

        .btn-nova-inner {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 13px 26px;
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-primary);
          letter-spacing: 0.02em;
        }

        .btn-nova-demanda:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201, 162, 39, 0.4);
        }

        .btn-nova-demanda:active {
          transform: translateY(0);
        }

        /* ── Stats Grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .stat-card {
          position: relative;
          background: var(--color-white);
          border-radius: var(--radius-lg);
          padding: 22px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          transition: var(--transition-smooth);
          animation: slideInUp 0.4s ease-out both;
        }

        .stat-card:nth-child(1) { animation-delay: 0.05s; }
        .stat-card:nth-child(2) { animation-delay: 0.10s; }
        .stat-card:nth-child(3) { animation-delay: 0.15s; }
        .stat-card:nth-child(4) { animation-delay: 0.20s; }

        .stat-card {
          cursor: pointer;
          user-select: none;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .stat-card--active {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .stat-total.stat-card--active    { border-color: var(--color-accent); box-shadow: 0 0 0 2px var(--color-accent), var(--shadow-md); }
        .stat-pendentes.stat-card--active { border-color: var(--color-warning); box-shadow: 0 0 0 2px var(--color-warning), var(--shadow-md); }
        .stat-resolvidos.stat-card--active { border-color: var(--color-success); box-shadow: 0 0 0 2px var(--color-success), var(--shadow-md); }
        .stat-urgentes.stat-card--active  { border-color: var(--color-danger); box-shadow: 0 0 0 2px var(--color-danger), var(--shadow-md); }

        .stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        .stat-total::after    { background: linear-gradient(90deg, var(--color-accent), #1e5aa8); }
        .stat-pendentes::after { background: linear-gradient(90deg, var(--color-warning), #f6c02c); }
        .stat-resolvidos::after { background: linear-gradient(90deg, var(--color-success), #12c98a); }
        .stat-urgentes::after  { background: linear-gradient(90deg, var(--color-danger), #f05975); }

        .stat-icon-wrap {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-total    .stat-icon-wrap { background: rgba(13, 46, 88, 0.08);  color: var(--color-accent); }
        .stat-pendentes .stat-icon-wrap { background: rgba(230, 168, 23, 0.1); color: var(--color-warning); }
        .stat-resolvidos .stat-icon-wrap { background: rgba(14, 164, 114, 0.1); color: var(--color-success); }
        .stat-urgentes .stat-icon-wrap { background: rgba(224, 56, 78, 0.1);  color: var(--color-danger); }

        .stat-body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8125rem;
          color: var(--color-text-light);
          font-weight: 400;
          margin-top: 4px;
          letter-spacing: 0.01em;
        }

        .stat-rate {
          position: absolute;
          top: 16px; right: 16px;
          background: linear-gradient(135deg, var(--color-success), #12c98a);
          color: white;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        .stat-glow {
          position: absolute;
          bottom: -20px; right: -20px;
          width: 80px; height: 80px;
          border-radius: 50%;
          opacity: 0.06;
          pointer-events: none;
        }
        .stat-glow--blue  { background: var(--color-accent); }
        .stat-glow--amber { background: var(--color-warning); }
        .stat-glow--green { background: var(--color-success); }
        .stat-glow--red   { background: var(--color-danger); }

        /* ── Filters Bar ── */
        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          background: var(--color-white);
          padding: 14px 18px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow-xs);
          margin-bottom: 18px;
          animation: fadeIn 0.4s ease-out 0.25s both;
        }

        .search-box {
          flex: 1;
          max-width: 420px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--color-cream);
          padding: 10px 16px;
          border-radius: var(--radius-md);
          border: 1.5px solid transparent;
          transition: var(--transition-smooth);
        }

        .search-box:focus-within {
          border-color: var(--color-gold);
          background: var(--color-white);
          box-shadow: 0 0 0 3px var(--color-gold-dim);
        }

        .search-icon { color: var(--color-text-muted); flex-shrink: 0; }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--color-text);
        }

        .search-box input:focus { outline: none; }
        .search-box input::placeholder { color: var(--color-text-muted); }

        .filter-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-select-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
          background: var(--color-cream);
          padding: 9px 14px;
          border-radius: var(--radius-md);
          border: 1.5px solid transparent;
          color: var(--color-text-light);
          transition: var(--transition-smooth);
        }

        .filter-select-wrap:focus-within {
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px var(--color-gold-dim);
          background: var(--color-white);
        }

        .filter-select-wrap select {
          background: none;
          border: none;
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-text);
          cursor: pointer;
        }

        .filter-select-wrap select:focus { outline: none; }

        .view-toggle {
          display: flex;
          background: var(--color-cream);
          border-radius: var(--radius-md);
          padding: 3px;
          gap: 2px;
        }

        .view-toggle button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-text-muted);
          transition: var(--transition-smooth);
        }

        .view-toggle button.active {
          background: var(--color-white);
          color: var(--color-gold);
          box-shadow: var(--shadow-sm);
        }

        .view-toggle button:hover:not(.active) {
          color: var(--color-text);
          background: rgba(255,255,255,0.5);
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .dashboard { padding: 20px 20px 0; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-box { max-width: none; }
          .filter-right { justify-content: space-between; }
        }

        @media (max-width: 560px) {
          .dashboard { padding: 16px 16px 0; }
          .dashboard-topbar {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          .topbar-right {
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .btn-nova-demanda {
            flex: 1;
          }
          .btn-nova-inner {
            justify-content: center;
          }
          .status-indicator {
            font-size: 0.7rem;
            padding: 5px 9px;
          }
          .user-btn {
            max-width: 130px;
            font-size: 0.7rem;
          }
          .stats-grid { grid-template-columns: 1fr; gap: 12px; }
        }
      `}</style>
    </div>
  );
}
