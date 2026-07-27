import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Demanda, AuthUser, EmpresaConfig, ColunaDef, CampoDef } from './types';
import { COLUNAS_KANBAN, CAMPOS_PADRAO } from './types';
import { useDemandasSocket } from './hooks/useDemandasSocket';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { ListaDemandas } from './components/ListaDemandas';
import { ModalDemanda } from './components/ModalDemanda';
import { FicharioDemanda } from './components/FicharioDemanda';
import { ConfiguracaoModal } from './components/ConfiguracaoModal';
import { EquipeModal } from './components/EquipeModal';
import { Relatorio } from './components/Relatorio';
import { LoginPage } from './components/LoginPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'somma-auth-token';
const USUARIO_KEY = 'somma-usuario';

const CONFIG_PADRAO: EmpresaConfig = { colunas: COLUNAS_KANBAN, camposDemanda: CAMPOS_PADRAO };

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
  } = useDemandasSocket(usuario?.nome ?? '', token, usuario?.empresaId);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [visualizacao, setVisualizacao] = useState<'kanban' | 'lista'>('kanban');
  const [modalAberto, setModalAberto] = useState(false);
  const [demandaEditando, setDemandaEditando] = useState<Demanda | null>(null);
  const [demandaFichario, setDemandaFichario] = useState<Demanda | null>(null);
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const [configAberto, setConfigAberto] = useState(false);
  const [equipeAberto, setEquipeAberto] = useState(false);
  const [config, setConfig] = useState<EmpresaConfig>(CONFIG_PADRAO);

  // Carrega a config da empresa (colunas + campos) após login
  useEffect(() => {
    if (!token) { setConfig(CONFIG_PADRAO); return; }
    let cancelado = false;
    fetch(`${API_URL}/api/empresa`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then((data: EmpresaConfig | null) => {
        if (cancelado || !data) return;
        setConfig({
          id: data.id,
          nome: data.nome,
          colunas: data.colunas?.length ? data.colunas : COLUNAS_KANBAN,
          camposDemanda: data.camposDemanda?.length ? data.camposDemanda : CAMPOS_PADRAO,
        });
      })
      .catch(() => { /* mantém o padrão em modo offline */ });
    return () => { cancelado = true; };
  }, [token]);

  const handleSalvarConfig = useCallback(async (dados: { colunas?: ColunaDef[]; camposDemanda?: CampoDef[] }) => {
    const res = await fetch(`${API_URL}/api/empresa`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('falha ao salvar config');
    const data: EmpresaConfig = await res.json();
    setConfig(prev => ({
      ...prev,
      colunas: data.colunas?.length ? data.colunas : prev.colunas,
      camposDemanda: data.camposDemanda?.length ? data.camposDemanda : prev.camposDemanda,
    }));
  }, [token]);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    pendentes: 0,
    resolvidos: 0,
    urgentes: 0,
    altaPrioridade: 0,
    taxaResolucao: 0,
    criticos: 0,
  });

  // Carregar estatísticas
  useEffect(() => {
    const loadStats = async () => {
      const stats = await obterEstatisticas();
      setEstatisticas(stats);
    };
    loadStats();
  }, [demandas, obterEstatisticas]);

  const VINTE_DIAS_MS = 20 * 24 * 60 * 60 * 1000;

  const demandasFiltradas = useMemo(() => {
    let resultado = buscarDemandas(busca);
    if (filtroStatus === 'em_andamento') {
      resultado = resultado.filter(d => d.status !== 'resolvido_finalizado');
    } else if (filtroStatus === 'criticos') {
      const agora = Date.now();
      resultado = resultado.filter(d => {
        if (d.status === 'resolvido_finalizado') return false;
        const rawData = d.dataCriacao || (d as any).createdAt;
        return rawData ? (agora - new Date(rawData).getTime()) >= VINTE_DIAS_MS : false;
      });
    } else if (filtroStatus === 'prioridade:urgente') {
      resultado = resultado.filter(d => d.prioridade === 'urgente' || d.prioridade === 'alta');
    } else if (filtroStatus === 'prioridade:alta') {
      resultado = resultado.filter(d => d.prioridade === 'alta');
    } else if (filtroStatus !== 'todos') {
      resultado = resultado.filter(d => d.status === filtroStatus);
    }
    return resultado;
  }, [demandas, busca, filtroStatus, buscarDemandas, VINTE_DIAS_MS]);

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

  const handleDuplicar = async (demanda: Demanda) => {
    try {
      const copia: Partial<Demanda> = {
        nomeCliente: `${demanda.nomeCliente} (CÓPIA)`,
        cnpj: demanda.cnpj,
        razaoSocial: demanda.razaoSocial,
        fantasia: demanda.fantasia,
        contato: demanda.contato,
        cidade: demanda.cidade,
        representante: demanda.representante,
        marca: demanda.marca,
        valor: demanda.valor,
        dataContato: demanda.dataContato,
        tipoProblema: demanda.tipoProblema,
        encaminhadoPara: demanda.encaminhadoPara,
        status: demanda.status,
        prioridade: demanda.prioridade,
        observacoes: demanda.observacoes,
        historicoObservacoes: demanda.historicoObservacoes,
        numeroNFDevolucao: demanda.numeroNFDevolucao,
        dataRecebimentoNF: demanda.dataRecebimentoNF,
      };
      await adicionarDemanda(copia as Omit<Demanda, 'id' | 'dataCriacao' | 'dataAtualizacao'>);
      setDemandaFichario(null);
    } catch {
      alert('Erro ao duplicar demanda. Tente novamente.');
    }
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
        demandas={demandas}
        estatisticas={estatisticas}
        colunas={config.colunas}
        busca={busca}
        setBusca={setBusca}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        visualizacao={visualizacao}
        setVisualizacao={setVisualizacao}
        onNovaDemanda={handleNovaDemanda}
        onRelatorio={() => setRelatorioAberto(true)}
        onConfig={() => setConfigAberto(true)}
        onEquipe={() => setEquipeAberto(true)}
        nomeUsuario={usuario.nome}
        statusConexao={statusConexao}
        onLogout={handleLogout}
      />

      <div className="content-area">
        {visualizacao === 'kanban' ? (
          <KanbanBoard
            demandas={demandasFiltradas}
            colunas={config.colunas}
            onMoverDemanda={moverDemanda}
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
          colunas={config.colunas}
          campos={config.camposDemanda}
          onSalvar={handleSalvarDemanda}
          onFechar={handleFecharModal}
          isEditando={!!demandaEditando}
        />
      )}

      {demandaFichario && (
        <FicharioDemanda
          demanda={demandaFichario}
          colunas={config.colunas}
          campos={config.camposDemanda}
          onFechar={() => setDemandaFichario(null)}
          onEditar={handleEditar}
          onDuplicar={handleDuplicar}
          onExcluir={excluirDemanda}
        />
      )}

      {configAberto && (
        <ConfiguracaoModal
          config={config}
          podeEditar={usuario.papel !== 'membro'}
          onSalvar={handleSalvarConfig}
          onFechar={() => setConfigAberto(false)}
        />
      )}

      {equipeAberto && (
        <EquipeModal
          token={token}
          usuarioId={usuario.id}
          podeGerenciar={usuario.papel !== 'membro'}
          onFechar={() => setEquipeAberto(false)}
        />
      )}

      {relatorioAberto && (
        <Relatorio
          demandas={demandas}
          onFechar={() => setRelatorioAberto(false)}
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
