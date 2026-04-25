import { useState, useEffect, useMemo } from 'react';
import type { Demanda } from './types';
import { useDemandasSocket } from './hooks/useDemandasSocket';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { ListaDemandas } from './components/ListaDemandas';
import { ModalDemanda } from './components/ModalDemanda';
import { ModalUsuario } from './components/ModalUsuario';
import { Users } from 'lucide-react';

function App() {
  const [usuario, setUsuario] = useState<string>(() => {
    return localStorage.getItem('somma-usuario') || '';
  });
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(!usuario);
  
  const {
    demandas,
    carregando,
    conectado,
    adicionarDemanda,
    atualizarDemanda,
    moverDemanda,
    excluirDemanda,
    buscarDemandas,
    obterEstatisticas,
  } = useDemandasSocket(usuario);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [visualizacao, setVisualizacao] = useState<'kanban' | 'lista'>('kanban');
  const [modalAberto, setModalAberto] = useState(false);
  const [demandaEditando, setDemandaEditando] = useState<Demanda | null>(null);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    pendentes: 0,
    resolvidos: 0,
    urgentes: 0,
    altaPrioridade: 0,
    taxaResolucao: 0,
  });

  // Carregar estatísticas
  useEffect(() => {
    const loadStats = async () => {
      const stats = await obterEstatisticas();
      setEstatisticas(stats);
    };
    loadStats();
  }, [demandas, obterEstatisticas]);

  const demandasFiltradas = useMemo(() => {
    let resultado = buscarDemandas(busca);
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(d => d.status === filtroStatus);
    }
    return resultado;
  }, [demandas, busca, filtroStatus, buscarDemandas]);

  const handleSalvarDemanda = async (dados: Partial<Demanda>) => {
    try {
      if (demandaEditando) {
        await atualizarDemanda(demandaEditando._id || demandaEditando.id, dados);
      } else {
        await adicionarDemanda(dados as Omit<Demanda, 'id' | 'dataCriacao' | 'dataAtualizacao'>);
      }
      setDemandaEditando(null);
    } catch (error) {
      alert('Erro ao salvar demanda. Tente novamente.');
    }
  };

  const handleEditar = (demanda: Demanda) => {
    setDemandaEditando(demanda);
    setModalAberto(true);
  };

  const handleNovaDemanda = () => {
    if (!usuario) {
      setMostrarModalUsuario(true);
      return;
    }
    setDemandaEditando(null);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setDemandaEditando(null);
  };

  const handleDefinirUsuario = (nome: string) => {
    setUsuario(nome);
    localStorage.setItem('somma-usuario', nome);
    setMostrarModalUsuario(false);
  };

  const handleTrocarUsuario = () => {
    setMostrarModalUsuario(true);
  };

  if (carregando) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Conectando ao SOMMA CRM...</p>
        <style>{`
          .loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            background: linear-gradient(135deg, var(--color-cream) 0%, #ede8e0 100%);
          }
          
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid var(--color-border);
            border-top-color: var(--color-accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .loading p {
            color: var(--color-text-light);
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="connection-status">
        <div className={`status-indicator ${conectado ? 'online' : 'offline'}`}>
          {conectado ? '🟢 Online' : '🔴 Offline'}
        </div>
        {usuario && (
          <button className="user-btn" onClick={handleTrocarUsuario}>
            <Users size={14} />
            {usuario}
          </button>
        )}
      </div>

      <Dashboard
        estatisticas={estatisticas}
        busca={busca}
        setBusca={setBusca}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        visualizacao={visualizacao}
        setVisualizacao={setVisualizacao}
        onNovaDemanda={handleNovaDemanda}
      />

      <div className="content-area">
        {visualizacao === 'kanban' ? (
          <KanbanBoard
            demandas={demandasFiltradas}
            onMoverDemanda={moverDemanda}
            onEditar={handleEditar}
            onExcluir={excluirDemanda}
          />
        ) : (
          <ListaDemandas
            demandas={demandasFiltradas}
            onEditar={handleEditar}
            onExcluir={excluirDemanda}
          />
        )}
      </div>

      {modalAberto && (
        <ModalDemanda
          demanda={demandaEditando}
          onSalvar={handleSalvarDemanda}
          onFechar={handleFecharModal}
          isEditando={!!demandaEditando}
        />
      )}

      {mostrarModalUsuario && (
        <ModalUsuario
          onDefinirUsuario={handleDefinirUsuario}
          usuarioAtual={usuario}
        />
      )}

      <style>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-cream) 0%, #ede8e0 100%);
        }

        .connection-status {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-indicator {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--color-white);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
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
        }

        .user-btn:hover {
          background: var(--color-highlight);
        }

        .content-area {
          padding: 0 32px 32px;
          max-width: 1800px;
          margin: 0 auto;
        }

        @media (max-width: 640px) {
          .content-area {
            padding: 0 16px 16px;
          }
          
          .connection-status {
            top: 8px;
            right: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
