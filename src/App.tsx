import { useState, useEffect, useMemo } from 'react';
import type { Demanda, AuthUser } from './types';
import { useDemandasSocket } from './hooks/useDemandasSocket';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { ListaDemandas } from './components/ListaDemandas';
import { ModalDemanda } from './components/ModalDemanda';
import { FicharioDemanda } from './components/FicharioDemanda';
import { LoginPage } from './components/LoginPage';

const TOKEN_KEY = 'somma-auth-token';
const USUARIO_KEY = 'somma-usuario';

function lerSessao(): { usuario: AuthUser | null; token: string | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  try {
    const raw = localStorage.getItem(USUARIO_KEY);
    if (!raw) return { usuario: null, token: null };
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return { usuario: { id: 'offline', nome: parsed, email: '' }, token: null };
    }
    return { usuario: parsed as AuthUser, token };
  } catch {
    return { usuario: null, token: null };
  }
}

function App() {
  const sessaoInicial = lerSessao();
  const [usuario, setUsuario] = useState<AuthUser | null>(sessaoInicial.usuario);
  const [token, setToken] = useState<string | null>(sessaoInicial.token);

  const {
    demandas,
    statusConexao,
    adicionarDemanda,
    atualizarDemanda,
    moverDemanda,
    excluirDemanda,
    buscarDemandas,
    obterEstatisticas,
  } = useDemandasSocket(usuario?.nome ?? '', token);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [visualizacao, setVisualizacao] = useState<'kanban' | 'lista'>('kanban');
  const [modalAberto, setModalAberto] = useState(false);
  const [demandaEditando, setDemandaEditando] = useState<Demanda | null>(null);
  const [demandaFichario, setDemandaFichario] = useState<Demanda | null>(null);
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
    if (filtroStatus === 'prioridade:urgente') {
      resultado = resultado.filter(d => d.prioridade === 'urgente' || d.prioridade === 'alta');
    } else if (filtroStatus === 'prioridade:alta') {
      resultado = resultado.filter(d => d.prioridade === 'alta');
    } else if (filtroStatus !== 'todos') {
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
    } catch {
      alert('Erro ao salvar demanda. Tente novamente.');
    }
  };

  const handleEditar = (demanda: Demanda) => {
    setDemandaEditando(demanda);
    setModalAberto(true);
  };

  const handleNovaDemanda = () => {
    setDemandaEditando(null);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setDemandaEditando(null);
  };

  const handleVerFichario = (demanda: Demanda) => {
    setDemandaFichario(demanda);
  };

  const handleLogin = (novoToken: string, novoUsuario: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, novoToken);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(novoUsuario));
    setToken(novoToken);
    setUsuario(novoUsuario);
  };

  const handleOffline = (nome: string) => {
    const usuarioOffline: AuthUser = { id: 'offline', nome, email: '' };
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuarioOffline));
    setToken(null);
    setUsuario(usuarioOffline);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setToken(null);
    setUsuario(null);
  };

  // Tela de login
  if (!usuario) {
    return <LoginPage onLogin={handleLogin} onOffline={handleOffline} />;
  }

  return (
    <div className="app">
      <Dashboard
        estatisticas={estatisticas}
        busca={busca}
        setBusca={setBusca}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        visualizacao={visualizacao}
        setVisualizacao={setVisualizacao}
        onNovaDemanda={handleNovaDemanda}
        nomeUsuario={usuario.nome}
        statusConexao={statusConexao}
        onLogout={handleLogout}
      />

      <div className="content-area">
        {visualizacao === 'kanban' ? (
          <KanbanBoard
            demandas={demandasFiltradas}
            onMoverDemanda={moverDemanda}
            onEditar={handleEditar}
            onExcluir={excluirDemanda}
            onVerFichario={handleVerFichario}
          />
        ) : (
          <ListaDemandas
            demandas={demandasFiltradas}
            onEditar={handleEditar}
            onExcluir={excluirDemanda}
            onVerFichario={handleVerFichario}
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

      {demandaFichario && (
        <FicharioDemanda
          demanda={demandaFichario}
          onFechar={() => setDemandaFichario(null)}
        />
      )}

      <style>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-cream) 0%, #ede8e0 100%);
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
        }
      `}</style>
    </div>
  );
}

export default App;
