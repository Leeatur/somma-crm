import type { Demanda } from '../types';
import { COLUNAS_KANBAN } from '../types';
import { Search, Filter, Plus, LayoutGrid, List, CheckCircle2, Clock, AlertTriangle, BarChart3, LogOut, FileText } from 'lucide-react';

interface DashboardProps {
  demandas: Demanda[];
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
  demandas,
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

  // Conta por status diretamente dos dados
  const porStatus = COLUNAS_KANBAN.map(col => ({
    ...col,
    count: demandas.filter(d => d.status === col.id).length,
  }));

  const urgentesTotal = estatisticas.urgentes + estatisticas.altaPrioridade;

  return (
    <div className="dash">

      {/* ══ Top Bar ══ */}
      <div className="dash-topbar">
        <div className="dash-brand">
          <div className="dash-emblem">S</div>
          <div>
            <h1 className="dash-title">SOMMA</h1>
            <p className="dash-sub">Gestão de Demandas</p>
          </div>
        </div>

        <div className="dash-actions">
          <div className={`dash-status ${statusConexao}`}>
            <span className="dash-status-dot" />
            {statusConexao === 'online' && 'Online'}
            {statusConexao === 'offline' && 'Offline'}
            {statusConexao === 'conectando' && 'Conectando…'}
          </div>

          <button className="dash-user-btn" onClick={onLogout} title="Sair">
            <span className="dash-user-avatar">{nomeUsuario.charAt(0).toUpperCase()}</span>
            <span className="dash-user-name">{nomeUsuario}</span>
            <LogOut size={13} style={{ opacity: 0.6, marginLeft: 2 }} />
          </button>

          <button className="dash-btn-rel" onClick={onRelatorio}>
            <FileText size={15} /> Relatório
          </button>

          <button className="dash-btn-nova" onClick={onNovaDemanda}>
            <Plus size={18} strokeWidth={2.5} />
            <span>Nova Demanda</span>
          </button>
        </div>
      </div>

      {/* ══ Métricas principais ══ */}
      <div className="dash-metrics">

        <div
          className={`metric-card metric-total ${filtroStatus === 'todos' ? 'mc-active' : ''}`}
          onClick={() => setFiltroStatus('todos')}
        >
          <div className="mc-icon mc-icon-blue"><BarChart3 size={22} /></div>
          <div className="mc-body">
            <span className="mc-num">{estatisticas.total}</span>
            <span className="mc-label">Total de Demandas</span>
          </div>
          <div className="mc-bar" style={{ background: 'linear-gradient(90deg,#0d2e58,#1e5aa8)' }} />
        </div>

        <div
          className={`metric-card metric-andamento ${filtroStatus === 'em_andamento' ? 'mc-active' : ''}`}
          onClick={() => setFiltroStatus('em_andamento')}
        >
          <div className="mc-icon mc-icon-amber"><Clock size={22} /></div>
          <div className="mc-body">
            <span className="mc-num">{estatisticas.pendentes}</span>
            <span className="mc-label">Em Andamento</span>
            <span className="mc-sub">{estatisticas.total > 0 ? Math.round((estatisticas.pendentes/estatisticas.total)*100) : 0}% do total</span>
          </div>
          <div className="mc-bar" style={{ background: 'linear-gradient(90deg,#d97706,#fbbf24)' }} />
        </div>

        <div
          className={`metric-card metric-resolvidos ${filtroStatus === 'resolvido_finalizado' ? 'mc-active' : ''}`}
          onClick={() => setFiltroStatus('resolvido_finalizado')}
        >
          <div className="mc-icon mc-icon-green"><CheckCircle2 size={22} /></div>
          <div className="mc-body">
            <span className="mc-num">{estatisticas.resolvidos}</span>
            <span className="mc-label">Resolvidos</span>
            <span className="mc-sub">{estatisticas.taxaResolucao}% de resolução</span>
          </div>
          <div className="mc-progress-wrap">
            <div className="mc-progress-bar" style={{ width: `${estatisticas.taxaResolucao}%` }} />
          </div>
          <div className="mc-bar" style={{ background: 'linear-gradient(90deg,#059669,#10b981)' }} />
        </div>

        <div
          className={`metric-card metric-urgentes ${filtroStatus === 'prioridade:urgente' ? 'mc-active' : ''}`}
          onClick={() => setFiltroStatus('prioridade:urgente')}
        >
          <div className="mc-icon mc-icon-red"><AlertTriangle size={22} /></div>
          <div className="mc-body">
            <span className="mc-num">{urgentesTotal}</span>
            <span className="mc-label">Urgentes / Alta</span>
            <span className="mc-sub">{estatisticas.urgentes} urgentes · {estatisticas.altaPrioridade} alta</span>
          </div>
          <div className="mc-bar" style={{ background: 'linear-gradient(90deg,#dc2626,#f87171)' }} />
        </div>
      </div>

      {/* ══ Status breakdown — todos os 7 status ══ */}
      <div className="dash-status-grid">
        {porStatus.map(col => {
          const pct = estatisticas.total > 0 ? Math.round((col.count / estatisticas.total) * 100) : 0;
          const isActive = filtroStatus === col.id;
          return (
            <div
              key={col.id}
              className={`status-tile ${isActive ? 'st-active' : ''}`}
              style={{ '--st-cor': col.cor } as React.CSSProperties}
              onClick={() => setFiltroStatus(isActive ? 'todos' : col.id)}
            >
              <div className="st-top">
                <span className="st-dot" style={{ background: col.cor }} />
                <span className="st-count" style={{ color: col.cor }}>{col.count}</span>
              </div>
              <span className="st-label">{col.titulo}</span>
              <div className="st-bar-bg">
                <div className="st-bar-fill" style={{ width: `${pct}%`, background: col.cor }} />
              </div>
              <span className="st-pct">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* ══ Barra de busca e filtros ══ */}
      <div className="dash-filterbar">
        <div className="dash-search">
          <Search size={15} className="dash-search-icon" />
          <input
            type="text"
            placeholder="Buscar cliente, marca, representante…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          {busca && (
            <button className="dash-search-clear" onClick={() => setBusca('')}>✕</button>
          )}
        </div>

        <div className="dash-filter-right">
          <div className="dash-select-wrap">
            <Filter size={13} />
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="todos">Todos os Status</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvido_finalizado">Resolvido/Finalizado</option>
              <option value="prioridade:urgente">Urgentes / Alta</option>
              <optgroup label="─ Por Status ─">
                {COLUNAS_KANBAN.map(col => (
                  <option key={col.id} value={col.id}>{col.titulo}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="dash-view-toggle">
            <button className={visualizacao === 'kanban' ? 'active' : ''} onClick={() => setVisualizacao('kanban')} title="Kanban">
              <LayoutGrid size={16} />
            </button>
            <button className={visualizacao === 'lista' ? 'active' : ''} onClick={() => setVisualizacao('lista')} title="Lista">
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* ══ Dashboard wrapper ══ */
        .dash {
          padding: 22px 32px 0;
          max-width: 1900px;
          margin: 0 auto;
        }

        /* ══ Top Bar ══ */
        .dash-topbar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px; gap: 12px;
          animation: fadeIn 0.4s ease-out;
        }
        .dash-brand { display: flex; align-items: center; gap: 14px; }
        .dash-emblem {
          width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(145deg, var(--color-gold) 0%, #a87820 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 1.7rem; font-weight: 800;
          color: var(--color-primary);
          box-shadow: 0 4px 20px rgba(201,162,39,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
          animation: pulse-ring 3s ease-in-out infinite;
        }
        .dash-title {
          font-family: var(--font-display); font-size: 1.75rem; font-weight: 700;
          color: var(--color-primary); letter-spacing: 0.1em; line-height: 1; margin: 0;
        }
        .dash-sub { font-size: 0.8rem; color: var(--color-text-light); margin: 3px 0 0; }

        .dash-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }

        /* Status pill */
        .dash-status {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 20px;
          font-size: 0.72rem; font-weight: 600;
          background: var(--color-white); border: 1px solid var(--color-border);
          box-shadow: var(--shadow-xs);
        }
        .dash-status-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        }
        .dash-status.online { color: var(--color-success); }
        .dash-status.online .dash-status-dot { background: var(--color-success); box-shadow: 0 0 6px var(--color-success); }
        .dash-status.offline { color: var(--color-danger); }
        .dash-status.offline .dash-status-dot { background: var(--color-danger); }
        .dash-status.conectando { color: var(--color-warning); }
        .dash-status.conectando .dash-status-dot { background: var(--color-warning); animation: pulse-ring 1s infinite; }

        /* User */
        .dash-user-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 13px 6px 6px;
          background: var(--color-primary);
          color: var(--color-white); border: none; border-radius: 20px;
          font-size: 0.75rem; font-weight: 600; cursor: pointer;
          transition: var(--transition-smooth);
        }
        .dash-user-btn:hover { background: var(--color-highlight); }
        .dash-user-avatar {
          width: 26px; height: 26px; border-radius: 50%; background: var(--color-gold);
          color: var(--color-primary); display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.75rem; flex-shrink: 0;
        }
        .dash-user-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Botões */
        .dash-btn-rel {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 16px;
          background: var(--color-white); color: var(--color-primary);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: var(--transition-smooth); box-shadow: var(--shadow-xs);
          white-space: nowrap;
        }
        .dash-btn-rel:hover { border-color: var(--color-gold); color: var(--color-gold); box-shadow: 0 0 0 3px var(--color-gold-dim); }

        .dash-btn-nova {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 22px;
          background: linear-gradient(135deg, var(--color-gold) 0%, #a87820 100%);
          color: var(--color-primary); border: none; border-radius: var(--radius-md);
          font-size: 0.875rem; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 18px rgba(201,162,39,0.35);
          transition: var(--transition-spring);
          white-space: nowrap;
        }
        .dash-btn-nova:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,162,39,0.45); }
        .dash-btn-nova:active { transform: translateY(0); }

        /* ══ Métricas ══ */
        .dash-metrics {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 16px;
          margin-bottom: 16px;
          animation: slideInUp 0.4s ease-out both;
        }

        .metric-card {
          position: relative; overflow: hidden;
          background: var(--color-white);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-lg);
          padding: 20px 20px 18px;
          display: flex; flex-direction: column; gap: 4px;
          box-shadow: var(--shadow-sm);
          cursor: pointer; user-select: none;
          transition: var(--transition-smooth);
        }
        .metric-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .metric-card.mc-active { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .metric-total.mc-active   { border-color: #0d2e58; box-shadow: 0 0 0 2px #0d2e5844, var(--shadow-md); }
        .metric-andamento.mc-active { border-color: #d97706; box-shadow: 0 0 0 2px #d9770644, var(--shadow-md); }
        .metric-resolvidos.mc-active { border-color: #059669; box-shadow: 0 0 0 2px #05966944, var(--shadow-md); }
        .metric-urgentes.mc-active  { border-color: #dc2626; box-shadow: 0 0 0 2px #dc262644, var(--shadow-md); }

        /* Barra de cor no topo */
        .mc-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3.5px; border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        .mc-icon {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px; flex-shrink: 0;
        }
        .mc-icon-blue  { background: rgba(13,46,88,0.09);  color: #0d2e58; }
        .mc-icon-amber { background: rgba(217,119,6,0.10); color: #d97706; }
        .mc-icon-green { background: rgba(5,150,105,0.10); color: #059669; }
        .mc-icon-red   { background: rgba(220,38,38,0.10); color: #dc2626; }

        .mc-num {
          font-family: var(--font-display); font-size: 2.4rem; font-weight: 800;
          color: var(--color-primary); line-height: 1;
        }
        .mc-label {
          font-size: 0.78rem; color: var(--color-text-light); font-weight: 500; margin-top: 2px;
        }
        .mc-sub {
          font-size: 0.68rem; color: var(--color-text-muted); margin-top: 4px;
        }

        /* Barra de progresso de resolução */
        .mc-progress-wrap {
          height: 4px; border-radius: 99px;
          background: #e5e7eb; margin-top: 8px; overflow: hidden;
        }
        .mc-progress-bar {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg,#059669,#10b981);
          transition: width 0.6s ease;
        }

        /* ══ Status Grid ══ */
        .dash-status-grid {
          display: grid; grid-template-columns: repeat(7,1fr); gap: 10px;
          margin-bottom: 18px;
          animation: slideInUp 0.4s ease-out 0.08s both;
        }

        .status-tile {
          background: var(--color-white);
          border: 1.5px solid var(--color-border-light);
          border-radius: var(--radius-md);
          padding: 12px 13px 10px;
          cursor: pointer; user-select: none;
          transition: var(--transition-smooth);
          display: flex; flex-direction: column; gap: 4px;
        }
        .status-tile:hover {
          border-color: var(--st-cor);
          box-shadow: 0 4px 16px color-mix(in srgb, var(--st-cor) 20%, transparent);
          transform: translateY(-2px);
        }
        .status-tile.st-active {
          background: color-mix(in srgb, var(--st-cor) 8%, white);
          border-color: var(--st-cor);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--st-cor) 30%, transparent), var(--shadow-sm);
          transform: translateY(-2px);
        }
        .st-top { display: flex; align-items: center; justify-content: space-between; }
        .st-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .st-count { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; line-height: 1; }
        .st-label {
          font-size: 0.6rem; color: var(--color-text-light); font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.3;
          flex: 1; display: flex; align-items: center;
        }
        .st-bar-bg {
          height: 3px; border-radius: 99px; background: var(--color-border-light);
          overflow: hidden; margin-top: 2px;
        }
        .st-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
        .st-pct { font-size: 0.6rem; color: var(--color-text-muted); font-weight: 600; align-self: flex-end; }

        /* ══ Filter bar ══ */
        .dash-filterbar {
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; background: var(--color-white);
          padding: 12px 16px; border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow-xs); margin-bottom: 18px;
          animation: fadeIn 0.4s ease-out 0.15s both;
        }
        .dash-search {
          flex: 1; max-width: 440px;
          display: flex; align-items: center; gap: 10px;
          background: var(--color-cream); padding: 9px 14px;
          border-radius: var(--radius-md); border: 1.5px solid transparent;
          transition: var(--transition-smooth);
        }
        .dash-search:focus-within { border-color: var(--color-gold); background: #fff; box-shadow: 0 0 0 3px var(--color-gold-dim); }
        .dash-search-icon { color: var(--color-text-muted); flex-shrink: 0; }
        .dash-search input {
          flex: 1; background: none; border: none; outline: none;
          font-family: var(--font-body); font-size: 0.875rem; color: var(--color-text);
        }
        .dash-search input::placeholder { color: var(--color-text-muted); }
        .dash-search-clear {
          background: none; border: none; color: var(--color-text-muted);
          cursor: pointer; font-size: 0.75rem; padding: 0 2px; line-height: 1;
        }
        .dash-search-clear:hover { color: var(--color-danger); }

        .dash-filter-right { display: flex; align-items: center; gap: 10px; }
        .dash-select-wrap {
          display: flex; align-items: center; gap: 7px;
          background: var(--color-cream); padding: 8px 13px;
          border-radius: var(--radius-md); border: 1.5px solid transparent;
          color: var(--color-text-light); transition: var(--transition-smooth);
        }
        .dash-select-wrap:focus-within { border-color: var(--color-gold); box-shadow: 0 0 0 3px var(--color-gold-dim); background: #fff; }
        .dash-select-wrap select {
          background: none; border: none; outline: none;
          font-family: var(--font-body); font-size: 0.82rem; color: var(--color-text); cursor: pointer;
        }

        .dash-view-toggle { display: flex; background: var(--color-cream); border-radius: var(--radius-md); padding: 3px; gap: 2px; }
        .dash-view-toggle button {
          width: 36px; height: 36px; background: none; border: none;
          border-radius: var(--radius-sm); cursor: pointer;
          color: var(--color-text-muted); transition: var(--transition-smooth);
          display: flex; align-items: center; justify-content: center;
        }
        .dash-view-toggle button.active { background: var(--color-white); color: var(--color-gold); box-shadow: var(--shadow-sm); }
        .dash-view-toggle button:hover:not(.active) { color: var(--color-text); background: rgba(255,255,255,0.5); }

        /* ══ Responsive ══ */
        @media (max-width: 1280px) {
          .dash-status-grid { grid-template-columns: repeat(4,1fr); }
        }
        @media (max-width: 1100px) {
          .dash { padding: 18px 20px 0; }
          .dash-metrics { grid-template-columns: repeat(2,1fr); }
          .dash-status-grid { grid-template-columns: repeat(4,1fr); }
        }
        @media (max-width: 768px) {
          .dash-metrics { grid-template-columns: repeat(2,1fr); }
          .dash-status-grid { grid-template-columns: repeat(3,1fr); }
          .dash-filterbar { flex-direction: column; align-items: stretch; }
          .dash-search { max-width: none; }
          .dash-filter-right { justify-content: space-between; }
        }
        @media (max-width: 500px) {
          .dash { padding: 14px 14px 0; }
          .dash-topbar { flex-direction: column; align-items: stretch; gap: 10px; }
          .dash-actions { flex-wrap: wrap; }
          .dash-metrics { grid-template-columns: 1fr 1fr; gap: 10px; }
          .dash-status-grid { grid-template-columns: repeat(2,1fr); }
          .mc-num { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
