import { useState, useEffect, useCallback } from 'react';
import type { Demanda } from '../types';
import { io, type Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useDemandasSocket(usuario: string) {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [, setSocket] = useState<Socket | null>(null);
  const [conectado, setConectado] = useState(false);

  // Conectar ao Socket.io
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Conectado ao servidor');
      setConectado(true);
      // Identificar usuário
      newSocket.emit('usuario:identificar', usuario);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Desconectado do servidor');
      setConectado(false);
    });

    // Escutar eventos de demandas
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

    return () => {
      newSocket.close();
    };
  }, [usuario]);

  // Carregar demandas iniciais
  useEffect(() => {
    carregarDemandas();
  }, []);

  const carregarDemandas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/demandas`);
      const data = await response.json();
      setDemandas(data);
    } catch (error) {
      console.error('Erro ao carregar demandas:', error);
    } finally {
      setCarregando(false);
    }
  };

  const adicionarDemanda = async (demanda: Omit<Demanda, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => {
    try {
      const response = await fetch(`${API_URL}/api/demandas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...demanda, usuario }),
      });
      const novaDemanda = await response.json();
      return novaDemanda;
    } catch (error) {
      console.error('Erro ao adicionar demanda:', error);
      throw error;
    }
  };

  const atualizarDemanda = async (id: string, dados: Partial<Demanda>) => {
    try {
      const response = await fetch(`${API_URL}/api/demandas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, usuario }),
      });
      const demandaAtualizada = await response.json();
      return demandaAtualizada;
    } catch (error) {
      console.error('Erro ao atualizar demanda:', error);
      throw error;
    }
  };

  const moverDemanda = async (id: string, novoStatus: Demanda['status']) => {
    return atualizarDemanda(id, { status: novoStatus });
  };

  const excluirDemanda = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/demandas/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario }),
      });
    } catch (error) {
      console.error('Erro ao excluir demanda:', error);
      throw error;
    }
  };

  const buscarDemandas = useCallback((termo: string) => {
    if (!termo.trim()) return demandas;
    const termoLower = termo.toLowerCase();
    return demandas.filter(
      d =>
        d.nomeCliente.toLowerCase().includes(termoLower) ||
        d.marca.toLowerCase().includes(termoLower) ||
        d.encaminhadoPara.toLowerCase().includes(termoLower) ||
        (d.observacoes && d.observacoes.toLowerCase().includes(termoLower))
    );
  }, [demandas]);

  const obterEstatisticas = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/estatisticas`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total: demandas.length,
        pendentes: demandas.filter(d => d.status === 'pendente').length,
        resolvidos: demandas.filter(d => d.status === 'resolvido').length,
        urgentes: demandas.filter(d => d.prioridade === 'urgente').length,
        altaPrioridade: demandas.filter(d => d.prioridade === 'alta').length,
        taxaResolucao: demandas.length > 0 ? Math.round((demandas.filter(d => d.status === 'resolvido').length / demandas.length) * 100) : 0,
      };
    }
  }, [demandas]);

  return {
    demandas,
    carregando,
    conectado,
    adicionarDemanda,
    atualizarDemanda,
    moverDemanda,
    excluirDemanda,
    buscarDemandas,
    obterEstatisticas,
    recarregar: carregarDemandas,
  };
}
