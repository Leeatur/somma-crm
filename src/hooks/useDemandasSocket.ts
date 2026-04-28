import { useState, useEffect, useCallback, useRef } from 'react';
import type { Demanda } from '../types';
import { io, type Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STORAGE_KEY = 'somma_crm_demandas';
// Render free tier pode levar até 60s para acordar
const BACKEND_TIMEOUT_MS = 70000;

function carregarDoStorage(): Demanda[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function salvarNoStorage(demandas: Demanda[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demandas));
  } catch {}
}

function gerarId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export type StatusConexao = 'conectando' | 'online' | 'offline';

export function useDemandasSocket(usuario: string, token?: string | null) {
  // Carrega do localStorage imediatamente — sem tela de loading
  const [demandas, setDemandas] = useState<Demanda[]>(carregarDoStorage);
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
    if (modoOffline) salvarNoStorage(demandas);
  }, [demandas, modoOffline]);

  // Tenta conectar ao backend em background (não bloqueia a UI)
  useEffect(() => {
    let cancelado = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    setStatusConexao('conectando');

    fetch(`${API_URL}/api/demandas`, { signal: controller.signal })
      .then(res => res.json())
      .then((data: Demanda[]) => {
        clearTimeout(timeoutId);
        if (cancelado) return;
        setDemandas(data);
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
        // mantém dados do localStorage já carregados
      });

    return () => {
      cancelado = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function iniciarSocket() {
    const newSocket = io(API_URL, { reconnectionAttempts: 5 });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setConectado(true);
      setModoOffline(false);
      setStatusConexao('online');
      newSocket.emit('usuario:identificar', usuario);
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
        salvarNoStorage(atualizado);
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
  }, [modoOffline, usuario]);

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
        salvarNoStorage(lista);
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
  }, [modoOffline, usuario]);

  const moverDemanda = useCallback(async (id: string, novoStatus: Demanda['status']) => {
    return atualizarDemanda(id, { status: novoStatus });
  }, [atualizarDemanda]);

  const excluirDemanda = useCallback(async (id: string) => {
    if (modoOffline) {
      setDemandas(prev => {
        const lista = prev.filter(d => (d._id || d.id) !== id);
        salvarNoStorage(lista);
        return lista;
      });
      return;
    }
    await fetch(`${API_URL}/api/demandas/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ usuario }),
    });
  }, [modoOffline, usuario]);

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
    const local = {
      total: demandas.length,
      pendentes: demandas.filter(d => d.status === 'pendente').length,
      resolvidos: demandas.filter(d => d.status === 'resolvido').length,
      urgentes: demandas.filter(d => d.prioridade === 'urgente').length,
      altaPrioridade: demandas.filter(d => d.prioridade === 'alta').length,
      taxaResolucao: demandas.length > 0
        ? Math.round((demandas.filter(d => d.status === 'resolvido').length / demandas.length) * 100)
        : 0,
    };
    if (modoOffline) return local;
    try {
      const response = await fetch(`${API_URL}/api/estatisticas`);
      return await response.json();
    } catch {
      return local;
    }
  }, [demandas, modoOffline]);

  const carregarDemandas = useCallback(async () => {
    if (modoOffline) { setDemandas(carregarDoStorage()); return; }
    try {
      const response = await fetch(`${API_URL}/api/demandas`);
      setDemandas(await response.json());
    } catch {}
  }, [modoOffline]);

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
