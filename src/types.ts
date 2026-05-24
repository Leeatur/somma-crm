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
  | 'aguardando_retorno_fabrica'
  | 'aguardando_retorno_cliente'
  | 'aguardando_nf_cliente'
  | 'aguardando_nf_fabrica'
  | 'aguardando_desconto'
  | 'credito_compras_futuras'
  | 'resolvido_finalizado';

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
  representante?: string;
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
  aguardando_retorno_fabrica: 'Aguardando Retorno da Fábrica',
  aguardando_retorno_cliente: 'Aguardando Retorno do Cliente',
  aguardando_nf_cliente: 'Aguardando NF do Cliente',
  aguardando_nf_fabrica: 'Aguardando NF da Fábrica',
  aguardando_desconto: 'Aguardando Desconto',
  credito_compras_futuras: 'Crédito para Abater em Compras Futuras',
  resolvido_finalizado: 'Resolvido/Finalizado',
};

export const PRIORIDADES: Record<Prioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const CORES_STATUS: Record<StatusSituacao, string> = {
  aguardando_retorno_fabrica: '#f97316',
  aguardando_retorno_cliente: '#ec4899',
  aguardando_nf_cliente:      '#a78bfa',
  aguardando_nf_fabrica:      '#f59e0b',
  aguardando_desconto:        '#dc2626',
  credito_compras_futuras:    '#ea580c',
  resolvido_finalizado:       '#059669',
};

export const CORES_PRIORIDADE: Record<Prioridade, string> = {
  baixa:   '#94a3b8',
  media:   '#3b82f6',
  alta:    '#f97316',
  urgente: '#ef4444',
};

export const COLUNAS_KANBAN: ColunaKanban[] = [
  { id: 'aguardando_desconto',        titulo: 'Aguardando Desconto',           cor: '#dc2626' },
  { id: 'credito_compras_futuras',    titulo: 'Crédito p/ Compras Futuras',    cor: '#ea580c' },
  { id: 'aguardando_retorno_fabrica', titulo: 'Aguardando Retorno da Fábrica', cor: '#f97316' },
  { id: 'aguardando_nf_fabrica',      titulo: 'Aguardando NF da Fábrica',      cor: '#f59e0b' },
  { id: 'aguardando_nf_cliente',      titulo: 'Aguardando NF do Cliente',      cor: '#a78bfa' },
  { id: 'aguardando_retorno_cliente', titulo: 'Aguardando Retorno do Cliente', cor: '#ec4899' },
  { id: 'resolvido_finalizado',       titulo: 'Resolvido/Finalizado',          cor: '#059669' },
];
