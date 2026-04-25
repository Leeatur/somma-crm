import { useState, useEffect } from 'react';
import type { Demanda } from '../types';

const STORAGE_KEY = 'somma-crm-demandas';

export function useDemandas() {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (dadosSalvos) {
      try {
        const parsed = JSON.parse(dadosSalvos);
        setDemandas(parsed);
      } catch (e) {
        console.error('Erro ao carregar demandas:', e);
      }
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (!carregando) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demandas));
    }
  }, [demandas, carregando]);

  const adicionarDemanda = (demanda: Omit<Demanda, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => {
    const novaDemanda: Demanda = {
      ...demanda,
      id: crypto.randomUUID(),
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };
    setDemandas(prev => [novaDemanda, ...prev]);
    return novaDemanda;
  };

  const atualizarDemanda = (id: string, dados: Partial<Demanda>) => {
    setDemandas(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, ...dados, dataAtualizacao: new Date().toISOString() }
          : d
      )
    );
  };

  const moverDemanda = (id: string, novoStatus: Demanda['status']) => {
    setDemandas(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              status: novoStatus,
              dataAtualizacao: new Date().toISOString(),
              ...(novoStatus === 'resolvido' ? { dataResolucao: new Date().toISOString() } : {}),
            }
          : d
      )
    );
  };

  const excluirDemanda = (id: string) => {
    setDemandas(prev => prev.filter(d => d.id !== id));
  };

  const buscarDemandas = (termo: string) => {
    if (!termo.trim()) return demandas;
    const termoLower = termo.toLowerCase();
    return demandas.filter(
      d =>
        d.nomeCliente.toLowerCase().includes(termoLower) ||
        d.marca.toLowerCase().includes(termoLower) ||
        d.encaminhadoPara.toLowerCase().includes(termoLower) ||
        d.observacoes.toLowerCase().includes(termoLower)
    );
  };

  const filtrarPorStatus = (status: Demanda['status'] | 'todos') => {
    if (status === 'todos') return demandas;
    return demandas.filter(d => d.status === status);
  };

  const obterEstatisticas = () => {
    const total = demandas.length;
    const pendentes = demandas.filter(d => d.status === 'pendente').length;
    const resolvidos = demandas.filter(d => d.status === 'resolvido').length;
    const urgentes = demandas.filter(d => d.prioridade === 'urgente').length;
    const altaPrioridade = demandas.filter(d => d.prioridade === 'alta').length;

    return {
      total,
      pendentes,
      resolvidos,
      urgentes,
      altaPrioridade,
      taxaResolucao: total > 0 ? Math.round((resolvidos / total) * 100) : 0,
    };
  };

  return {
    demandas,
    carregando,
    adicionarDemanda,
    atualizarDemanda,
    moverDemanda,
    excluirDemanda,
    buscarDemandas,
    filtrarPorStatus,
    obterEstatisticas,
  };
}
