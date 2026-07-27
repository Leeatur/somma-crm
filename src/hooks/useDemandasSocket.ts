import { useState, useEffect, useCallback, useRef } from 'react';
import type { Demanda } from '../types';
import { io, type Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// Cache local escopado por empresa — evita que os dados de uma empresa
// apareçam para outra no mesmo navegador.
const chaveStorage = (empresaId?: string) => `somma_crm_demandas_${empresaId || 'offline'}`;
// Render free tier pode levar até 60s para acordar
const BACKEND_TIMEOUT_MS = 70000;

function carregarDoStorage(empresaId?: string): Demanda[] {
  try {
    const raw = localStorage.getItem(chaveStorage(empresaId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function salvarNoStorage(demandas: Demanda[], empresaId?: string): void {
  try {
    localStorage.setItem(chaveStorage(empresaId), JSON.stringify(demandas));
  } catch {}
}

function gerarId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export type StatusConexao = 'conectando' | 'online' | 'offline';

export function useDemandasSocket(usuario: string, token?: string | null, empresaId?: string) {
  // Carrega do localStorage imediatamente — sem tela de loading
  const [demandas, setDemandas] = useState<Demanda[]>(() => carregarDoStorage(empresaId));
  const [carregando] = useState(false);
  const [statusConexao, setStatusConexao] = useState<StatusConexao>('conectando');
  const [conectado, setConectado] = useState(false);
  const [modoOffline, setModoOffline] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    if (modoOffline) salvarNoStorage(demandas, empresaId);
  }, [demandas, modoOffline, empresaId]);

  // Conecta ao backend. Re-executa ao trocar de conta/empresa (token/empresaId),
  // zerando os dados da conta anterior para NÃO vazar entre empresas.
  useEffect(() => {
    let cancelado = false;

    // Mostra imediatamente só o cache DESTA empresa (vazio p/ conta nova)
    setDemandas(carregarDoStorage(empresaId));
    // Encerra o socket da empresa anterior
    socketRef.current?.close();
    socketRef.current = null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    setStatusConexao('conectando');

    fetch(`${API_URL}/api/demandas`, { signal: controller.signal, headers: authHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Demanda[]) => {
        clearTimeout(timeoutId);
        if (cancelado) return;
        setDemandas(Array.isArray(data) ? data : []);
        setModoOffline(false);
        setStatusConexao('online');
        iniciarSocket();
      })
      .catch(() => {
        clearTimeout(timeoutId);
        if (cancelado) return;
        console.warn('[SOMMA CRM] Backend indisponível — modo offline');
        setModoOffline(true);
        setStatusConexao('offline');
        // mantém o cache desta empresa já carregado acima
      });

    return () => {
      cancelado = true;
      controller.abort();
      socketRef.current?.close();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, empresaId]);

  function iniciarSocket() {
    const newSocket = io(API_URL, { reconnectionAttempts: 5 });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setConectado(true);
      setModoOffline(false);
      setStatusConexao('online');
      newSocket.emit('usuario:identificar', { token, nome: usuario });
    });

    newSocket.on('disconnect', () => {
      setConectado(false);
      setStatusConexao('offline');
    });

    newSocket.on('demanda:criada', (demanda: Demanda) => {
      setDemandas(prev => [demanda, ...prev]);
    });

    newSocket.on('demanda:atualizada', (demanda: Demanda) => {
      setDemandas(prev =>
        prev.map(d => (d._id || d.id) === (demanda._id || demanda.id) ? demanda : d)
      );
    });

    newSocket.on('demanda:excluida', ({ id }: { id: string }) => {
      setDemandas(prev => prev.filter(d => (d._id || d.id) !== id));
    });

    return newSocket;
  }

  useEffect(() => {
    return () => { socketRef.current?.close(); };
  }, []);

  // --- CRUD ---

  const adicionarDemanda = useCallback(async (
    demanda: Omit<Demanda, 'id' | 'dataCriacao' | 'dataAtualizacao'>
  ) => {
    if (modoOffline) {
      const now = new Date().toISOString();
      const nova: Demanda = {
        ...demanda,
        id: gerarId(),
        dataCriacao: now,
        dataAtualizacao: now,
        usuario,
      } as Demanda;
      setDemandas(prev => {
        const atualizado = [nova, ...prev];
        salvarNoStorage(atualizado, empresaId);
        return atualizado;
      });
      return nova;
    }
    const response = await fetch(`${API_URL}/api/demandas`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ...demanda, usuario }),
    });
    const novaDemanda = await response.json();
    return novaDemanda;
  }, [modoOffline, usuario, empresaId]);

  const atualizarDemanda = useCallback(async (id: string, dados: Partial<Demanda>) => {
    if (modoOffline) {
      const now = new Date().toISOString();
      let atualizada: Demanda | undefined;
      setDemandas(prev => {
        const lista = prev.map(d => {
          if ((d._id || d.id) === id) {
            atualizada = { ...d, ...dados, dataAtualizacao: now };
            return atualizada;
          }
          return d;
        });
        salvarNoStorage(lista, empresaId);
        return lista;
      });
      return atualizada;
    }
    const response = await fetch(`${API_URL}/api/demandas/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ ...dados, usuario }),
    });
    const demandaAtualizada = await response.json();
    return demandaAtualizada;
  }, [modoOffline, usuario, empresaId]);

  const moverDemanda = useCallback(async (id: string, novoStatus: Demanda['status']) => {
    return atualizarDemanda(id, { status: novoStatus });
  }, [atualizarDemanda]);

  const excluirDemanda = useCallback(async (id: string) => {
    if (modoOffline) {
      setDemandas(prev => {
        const lista = prev.filter(d => (d._id || d.id) !== id);
        salvarNoStorage(lista, empresaId);
        return lista;
      });
      return;
    }
    await fetch(`${API_URL}/api/demandas/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ usuario }),
    });
  }, [modoOffline, usuario, empresaId]);

  const buscarDemandas = useCallback((termo: string) => {
    if (!termo.trim()) return demandas;
    const termoLower = termo.toLowerCase();
    return demandas.filter(d =>
      d.nomeCliente?.toLowerCase().includes(termoLower) ||
      d.marca?.toLowerCase().includes(termoLower) ||
      d.encaminhadoPara?.toLowerCase().includes(termoLower) ||
      d.observacoes?.toLowerCase().includes(termoLower)
    );
  }, [demandas]);

  const obterEstatisticas = useCallback(async () => {
    const VINTE_DIAS_MS = 20 * 24 * 60 * 60 * 1000;
    const agora = Date.now();
    const pendentes = demandas.filter(d => d.status !== 'resolvido_finalizado');
    const criticos = pendentes.filter(d => {
      const rawData = d.dataCriacao || (d as any).createdAt;
      return rawData ? (agora - new Date(rawData).getTime()) >= VINTE_DIAS_MS : false;
    });
    return {
      total: demandas.length,
      pendentes: pendentes.length,
      resolvidos: demandas.filter(d => d.status === 'resolvido_finalizado').length,
      urgentes: demandas.filter(d => d.prioridade === 'urgente').length,
      altaPrioridade: demandas.filter(d => d.prioridade === 'alta').length,
      taxaResolucao: demandas.length > 0
        ? Math.round((demandas.filter(d => d.status === 'resolvido_finalizado').length / demandas.length) * 100)
        : 0,
      criticos: criticos.length,
    };
  }, [demandas]);

  const carregarDemandas = useCallback(async () => {
    if (modoOffline) { setDemandas(carregarDoStorage(empresaId)); return; }
    try {
      const response = await fetch(`${API_URL}/api/demandas`);
      setDemandas(await response.json());
    } catch {}
  }, [modoOffline, empresaId]);

  return {
    demandas,
    carregando,
    conectado,
    statusConexao,
    modoOffline,
    adicionarDemanda,
    atualizarDemanda,
    moverDemanda,
    excluirDemanda,
    buscarDemandas,
    obterEstatisticas,
    recarregar: carregarDemandas,
  };
}
