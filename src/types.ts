// Tipos do CRM SOMMA

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
}

export type TipoProblema = 
  | 'devolucao_defeito'
  | 'devolucao_atraso'
  | 'devolucao_desconformidade'
  | 'devolucao_outros'
  | 'segunda_via_boleto'
  | 'segunda_via_nf'
  | 'peca_defeito'
  | 'troca_mercadoria'
  | 'outros';

export type StatusSituacao = 
  | 'pendente'
  | 'encaminhado_fabrica'
  | 'aguardando_retorno'
  | 'solicitacao_nf_devolucao'
  | 'nf_enviada_cliente'
  | 'resolvido_parcial'
  | 'resolvido';

export type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente';

export interface Demanda {
  _id?: string;
  id: string;
  nomeCliente: string;
  cnpj?: string;
  razaoSocial?: string;
  fantasia?: string;
  contato?: string;
  cidade?: string;
  marca: string;
  valor?: string;
  dataContato: string;
  tipoProblema: TipoProblema;
  encaminhadoPara: string;
  status: StatusSituacao;
  prioridade: Prioridade;
  observacoes: string;
  historicoObservacoes?: Array<{
    id: string;
    data: string;
    referencias: string;
    observacao: string;
    valor: string;
  }>;
  dataCriacao: string;
  dataAtualizacao: string;
  dataResolucao?: string;
  numeroNFDevolucao?: string;
  dataRecebimentoNF?: string;
  historico?: Array<{
    acao: string;
    usuario: string;
    data: string;
    campoAlterado: string;
    valorAnterior: string;
    valorNovo: string;
  }>;
  ultimaAlteracaoPor?: string;
  ultimaAlteracaoEm?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColunaKanban {
  id: StatusSituacao;
  titulo: string;
  cor: string;
}

export const TIPOS_PROBLEMA: Record<TipoProblema, string> = {
  devolucao_defeito: 'Devolução - Defeito',
  devolucao_atraso: 'Devolução - Atraso',
  devolucao_desconformidade: 'Devolução - Desconformidade',
  devolucao_outros: 'Devolução - Outros',
  segunda_via_boleto: '2ª Via de Boleto',
  segunda_via_nf: '2ª Via de NF',
  peca_defeito: 'Peça com Defeito',
  troca_mercadoria: 'Troca de Mercadoria',
  outros: 'Outros',
};

export const STATUS_SITUACAO: Record<StatusSituacao, string> = {
  pendente: 'Pendente',
  encaminhado_fabrica: 'Encaminhado para Fábrica',
  aguardando_retorno: 'Aguardando Retorno da Fábrica',
  solicitacao_nf_devolucao: 'Solicitação NF Devolução',
  nf_enviada_cliente: 'NF Enviada ao Cliente',
  resolvido_parcial: 'Crédito em Compras Futuras',
  resolvido: 'Resolvido',
};

export const PRIORIDADES: Record<Prioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const CORES_STATUS: Record<StatusSituacao, string> = {
  pendente: '#f59e0b',
  encaminhado_fabrica: '#3b82f6',
  aguardando_retorno: '#8b5cf6',
  solicitacao_nf_devolucao: '#ec4899',
  nf_enviada_cliente: '#06b6d4',
  resolvido_parcial: '#f97316',
  resolvido: '#10b981',
};

export const CORES_PRIORIDADE: Record<Prioridade, string> = {
  baixa: '#6b7280',
  media: '#3b82f6',
  alta: '#f59e0b',
  urgente: '#ef4444',
};

export const COLUNAS_KANBAN: ColunaKanban[] = [
  { id: 'pendente', titulo: 'Pendente', cor: '#f59e0b' },
  { id: 'encaminhado_fabrica', titulo: 'Encaminhado Fábrica', cor: '#3b82f6' },
  { id: 'aguardando_retorno', titulo: 'Aguardando Retorno', cor: '#8b5cf6' },
  { id: 'solicitacao_nf_devolucao', titulo: 'Solicitação NF', cor: '#ec4899' },
  { id: 'nf_enviada_cliente', titulo: 'NF Enviada', cor: '#06b6d4' },
  { id: 'resolvido_parcial', titulo: 'Crédito em Compras Futuras', cor: '#f97316' },
  { id: 'resolvido', titulo: 'Resolvido', cor: '#10b981' },
];
