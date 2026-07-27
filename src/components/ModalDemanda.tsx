import { useState, useEffect } from 'react';
import type { Demanda, ColunaDef, CampoDef } from '../types';
import { CORE_FIELD_KEYS } from '../types';
import { X, User, Building2, Phone, DollarSign, Package, CheckCircle2, Plus, Trash2, CalendarDays, Tag, FileText, MapPin, Hash } from 'lucide-react';

interface EntradaHistorico {
  id: string;
  data: string;
  referencias: string;
  observacao: string;
  valor: string;
  quantidade?: string;
}

interface ModalDemandaProps {
  demanda?: Demanda | null;
  colunas: ColunaDef[];
  campos: CampoDef[];
  onSalvar: (demanda: Partial<Demanda>) => void;
  onFechar: () => void;
  isEditando?: boolean;
}

const entradaVazia = (): EntradaHistorico => ({
  id: crypto.randomUUID(),
  data: new Date().toISOString().split('T')[0],
  referencias: '',
  observacao: '',
  valor: '',
  quantidade: '',
});

function parseHistorico(obs: string | undefined): EntradaHistorico[] {
  if (!obs) return [];
  try {
    const parsed = JSON.parse(obs);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

// Converte qualquer data (ISO ou já YYYY-MM-DD) para o formato do <input type="date">
function toDateInput(iso?: string): string {
  if (!iso) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

export function ModalDemanda({ demanda, colunas, campos, onSalvar, onFechar, isEditando = false }: ModalDemandaProps) {
  const [formData, setFormData] = useState<Partial<Demanda>>({
    nomeCliente: demanda?.nomeCliente || '',
    cnpj: demanda?.cnpj || '',
    dataCriacao: toDateInput(demanda?.dataCriacao || demanda?.createdAt) || new Date().toISOString().split('T')[0],
    status: (demanda?.status || colunas[0]?.id || 'aguardando_retorno_fabrica') as Demanda['status'],
    contato: demanda?.contato || '',
    cidade: demanda?.cidade || '',
    razaoSocial: demanda?.razaoSocial || '',
    representante: demanda?.representante || '',
    marca: demanda?.marca || '',
    valor: demanda?.valor || '',
    observacoes: demanda?.observacoes || '',
    historicoObservacoes: demanda?.historicoObservacoes?.length
      ? demanda.historicoObservacoes
      : parseHistorico(demanda?.observacoes),
    dataContato: demanda?.dataContato || new Date().toISOString().split('T')[0],
    tipoProblema: demanda?.tipoProblema || 'outros',
    encaminhadoPara: demanda?.encaminhadoPara || '',
    prioridade: demanda?.prioridade || 'media',
    camposCustom: (demanda as any)?.camposCustom || {},
  });

  // Valor de um campo (do topo do objeto se for campo do sistema, senão de camposCustom)
  const isCore = (key: string) => CORE_FIELD_KEYS.includes(key);
  const getVal = (campo: CampoDef): string => {
    const raw = isCore(campo.key)
      ? (formData as any)[campo.key]
      : ((formData.camposCustom as any) || {})[campo.key];
    return raw ?? '';
  };
  const setVal = (campo: CampoDef, value: string) => {
    if (isCore(campo.key)) {
      setFormData(prev => ({ ...prev, [campo.key]: value }));
    } else {
      setFormData(prev => ({ ...prev, camposCustom: { ...((prev.camposCustom as any) || {}), [campo.key]: value } }));
    }
  };

  const [novaEntrada, setNovaEntrada] = useState<EntradaHistorico>(entradaVazia());
  const [adicionando, setAdicionando] = useState(false);

  const historico = (formData.historicoObservacoes as EntradaHistorico[]) || [];

  // Soma automática dos valores do histórico → atualiza Valor Total em tempo real
  useEffect(() => {
    const soma = historico.reduce((acc, e) => {
      const v = parseFloat(e.valor?.replace(',', '.') || '0');
      return acc + (isNaN(v) ? 0 : v);
    }, 0);
    if (soma > 0) {
      const formatado = soma.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      setFormData(prev => ({ ...prev, valor: formatado }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.historicoObservacoes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dadosParaSalvar: Partial<Demanda> = {
      ...formData,
      observacoes: JSON.stringify(formData.historicoObservacoes || []),
      // Campos required no backend que o novo form não exibe — garante valor não-vazio
      encaminhadoPara: formData.encaminhadoPara || '-',
      dataContato: formData.dataContato || new Date().toISOString().split('T')[0],
      tipoProblema: formData.tipoProblema || 'outros',
      prioridade: formData.prioridade || 'media',
      // "Aberto em": converte YYYY-MM-DD → ISO (meio-dia local evita deslocar o dia por fuso)
      dataCriacao: formData.dataCriacao
        ? new Date(`${formData.dataCriacao}T12:00:00`).toISOString()
        : undefined,
    };
    onSalvar(dadosParaSalvar);
    onFechar();
  };

  const adicionarEntrada = () => {
    if (!novaEntrada.observacao.trim()) return;
    const entradaParaAdicionar = { ...novaEntrada };
    setFormData(prev => ({
      ...prev,
      historicoObservacoes: [entradaParaAdicionar, ...((prev.historicoObservacoes as EntradaHistorico[]) || [])],
    }));
    setNovaEntrada(entradaVazia());
    setAdicionando(false);
  };

  const removerEntrada = (id: string) => {
    setFormData(prev => ({
      ...prev,
      historicoObservacoes: ((prev.historicoObservacoes as EntradaHistorico[]) || []).filter(e => e.id !== id),
    }));
  };

  const formatCnpj = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 14);
    if (d.length > 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
    if (d.length > 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
    if (d.length > 5)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
    if (d.length > 2)  return `${d.slice(0,2)}.${d.slice(2)}`;
    return d;
  };

  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length > 7) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    if (d.length > 2) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length > 0) return `(${d}`;
    return d;
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const iconeCampo = (key: string) => {
    switch (key) {
      case 'nomeCliente': case 'razaoSocial': case 'representante': return <User size={16} />;
      case 'cnpj': case 'marca': return <Building2 size={16} />;
      case 'contato': return <Phone size={16} />;
      case 'cidade': return <MapPin size={16} />;
      case 'valor': return <DollarSign size={16} />;
      case 'dataCriacao': return <CalendarDays size={16} />;
      default: return <Tag size={16} />;
    }
  };

  const renderCampo = (campo: CampoDef) => {
    const val = getVal(campo);
    const req = !!campo.obrigatorio;
    let input;
    if (campo.tipo === 'selecao') {
      input = (
        <select value={val} onChange={e => setVal(campo, e.target.value)} required={req}>
          <option value="">Selecione…</option>
          {(campo.opcoes || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    } else if (campo.tipo === 'data') {
      input = <input type="date" value={val} onChange={e => setVal(campo, e.target.value)} required={req} />;
    } else if (campo.tipo === 'moeda' || campo.key === 'valor') {
      input = <input type="text" value={val} onChange={e => setVal(campo, e.target.value.replace(/[^\d,]/g, ''))} placeholder="0,00" inputMode="decimal" required={req} />;
    } else if (campo.tipo === 'numero') {
      input = <input type="text" value={val} onChange={e => setVal(campo, e.target.value.replace(/[^\d]/g, ''))} placeholder="0" inputMode="numeric" required={req} />;
    } else if (campo.key === 'cnpj') {
      input = <input type="text" value={val} onChange={e => setVal(campo, formatCnpj(e.target.value))} placeholder="00.000.000/0000-00" inputMode="numeric" maxLength={18} required={req} />;
    } else if (campo.key === 'contato') {
      input = <input type="text" value={val} onChange={e => setVal(campo, formatPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="numeric" maxLength={16} required={req} />;
    } else {
      input = <input type="text" value={val} onChange={e => setVal(campo, e.target.value)} placeholder={campo.label} required={req} />;
    }
    return (
      <div className="form-group" key={campo.key}>
        <label>{iconeCampo(campo.key)}{campo.label}{req ? ' *' : ''}</label>
        {input}
      </div>
    );
  };

  const camposAtivos = campos
    .filter(c => c.ativo !== false)
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-icon">
              {isEditando ? <CheckCircle2 size={24} /> : <Package size={24} />}
            </div>
            <div>
              <h2>{isEditando ? 'Editar Demanda' : 'Nova Demanda'}</h2>
              <p>Preencha os dados da solicitação</p>
            </div>
          </div>
          <button className="modal-close" onClick={onFechar}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Status é sempre exibido (define a coluna no kanban) */}
            <div className="form-group">
              <label><Tag size={16} />Status *</label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                required
              >
                {colunas.map(col => (
                  <option key={col.id} value={col.id}>{col.titulo}</option>
                ))}
              </select>
            </div>

            {/* Campos configuráveis por empresa */}
            {camposAtivos.map(renderCampo)}
          </div>

          {/* Histórico de Observações */}
          <div className="historico-section">
            <div className="historico-header">
              <label><FileText size={16} />Histórico de Observações</label>
              {!adicionando && (
                <button type="button" className="btn-add-entrada" onClick={() => setAdicionando(true)}>
                  <Plus size={15} />
                  Nova entrada
                </button>
              )}
            </div>

            {adicionando && (
              <div className="entrada-form">
                <div className="entrada-form-grid entrada-form-grid--5">
                  <div className="form-group">
                    <label><CalendarDays size={14} />Data</label>
                    <input
                      type="date"
                      value={novaEntrada.data}
                      onChange={e => setNovaEntrada(prev => ({ ...prev, data: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label><Tag size={14} />Referência</label>
                    <input
                      type="text"
                      value={novaEntrada.referencias}
                      onChange={e => setNovaEntrada(prev => ({ ...prev, referencias: e.target.value }))}
                      placeholder="NF, Pedido..."
                    />
                  </div>
                  <div className="form-group">
                    <label><Hash size={14} />Quant.</label>
                    <input
                      type="text"
                      value={novaEntrada.quantidade || ''}
                      onChange={e => setNovaEntrada(prev => ({ ...prev, quantidade: e.target.value.replace(/[^\d]/g, '') }))}
                      placeholder="0"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="form-group">
                    <label><FileText size={14} />Descrição *</label>
                    <input
                      type="text"
                      value={novaEntrada.observacao}
                      onChange={e => setNovaEntrada(prev => ({ ...prev, observacao: e.target.value }))}
                      placeholder="Descrição da entrada"
                    />
                  </div>
                  <div className="form-group">
                    <label><DollarSign size={14} />Valor</label>
                    <input
                      type="text"
                      value={novaEntrada.valor}
                      onChange={e => setNovaEntrada(prev => ({ ...prev, valor: e.target.value.replace(/[^\d,]/g, '') }))}
                      placeholder="0,00"
                      inputMode="decimal"
                    />
                  </div>
                </div>
                <div className="entrada-form-actions">
                  <button type="button" className="btn-secondary" onClick={() => { setAdicionando(false); setNovaEntrada(entradaVazia()); }}>
                    Cancelar
                  </button>
                  <button type="button" className="btn-primary" onClick={adicionarEntrada}>
                    <Plus size={15} />
                    Adicionar
                  </button>
                </div>
              </div>
            )}

            {historico.length > 0 ? (
              <div className="historico-lista">
                {historico.map(entrada => (
                  <div key={entrada.id} className="hist-line">
                    {entrada.data && (
                      <span className="meta-tag meta-data"><CalendarDays size={11} />{formatDate(entrada.data)}</span>
                    )}
                    {entrada.referencias && (
                      <span className="meta-tag meta-ref"><Tag size={11} />{entrada.referencias}</span>
                    )}
                    {entrada.quantidade && (
                      <span className="meta-tag meta-qty"><Hash size={11} />{entrada.quantidade}</span>
                    )}
                    {entrada.valor && (
                      <span className="meta-tag meta-valor"><DollarSign size={11} />R$ {entrada.valor}</span>
                    )}
                    {entrada.observacao && (
                      <span className="hist-line-desc">{entrada.observacao}</span>
                    )}
                    <button type="button" className="btn-remover" onClick={() => removerEntrada(entrada.id)} title="Remover">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !adicionando && (
                <div className="historico-vazio">
                  Nenhuma observação registrada. Clique em "Nova entrada" para começar.
                </div>
              )
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn-primary">
              {isEditando ? 'Salvar Alterações' : 'Criar Demanda'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(14, 18, 32, 0.75);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
          animation: fadeInFast 0.2s ease-out;
        }
        .modal-content {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          width: 100%; max-width: 820px; max-height: 92vh;
          overflow: hidden;
          box-shadow: var(--shadow-xl), 0 0 0 1px rgba(255,255,255,0.08);
          animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 26px;
          background: linear-gradient(145deg, var(--color-primary) 0%, #102040 100%);
          position: relative; overflow: hidden;
        }
        .modal-header::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent);
        }
        .modal-title { display: flex; align-items: center; gap: 14px; }
        .modal-icon {
          width: 46px; height: 46px;
          background: linear-gradient(145deg, var(--color-gold) 0%, #a87820 100%);
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-primary); box-shadow: var(--shadow-gold); flex-shrink: 0;
        }
        .modal-title h2 {
          font-family: var(--font-display); font-size: 1.5rem; font-weight: 700;
          color: var(--color-white); margin: 0; letter-spacing: 0.01em;
        }
        .modal-title p { color: rgba(255,255,255,0.55); font-size: 0.8125rem; margin: 3px 0 0; }
        .modal-close {
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); cursor: pointer; padding: 7px;
          border-radius: var(--radius-sm); display: flex; transition: var(--transition-smooth);
        }
        .modal-close:hover { background: rgba(255,255,255,0.15); color: var(--color-white); }
        .modal-form { padding: 26px 28px; overflow-y: auto; max-height: calc(92vh - 96px); }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-bottom: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label {
          display: flex; align-items: center; gap: 7px;
          font-weight: 600; font-size: 0.8125rem; color: var(--color-text); letter-spacing: 0.01em;
        }
        .form-group input, .form-group select, .form-group textarea {
          padding: 11px 14px;
          border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
          font-size: 0.9375rem; font-family: var(--font-body);
          color: var(--color-text); background: var(--color-white); transition: var(--transition-smooth);
        }
        .form-group textarea { resize: vertical; line-height: 1.5; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none; border-color: var(--color-gold); box-shadow: 0 0 0 3px var(--color-gold-dim);
        }
        .form-group input::placeholder, .form-group textarea::placeholder { color: var(--color-text-muted); }

        /* Histórico */
        .historico-section { margin-bottom: 20px; }
        .historico-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
        }
        .historico-header label {
          display: flex; align-items: center; gap: 7px;
          font-weight: 600; font-size: 0.8125rem; color: var(--color-text); letter-spacing: 0.01em;
        }
        .btn-add-entrada {
          display: flex; align-items: center; gap: 5px; padding: 6px 13px;
          background: linear-gradient(135deg, var(--color-gold) 0%, #a87820 100%);
          border: none; border-radius: var(--radius-md);
          color: var(--color-primary); font-family: var(--font-body);
          font-weight: 700; font-size: 0.8rem; cursor: pointer;
          transition: var(--transition-spring); box-shadow: var(--shadow-gold);
        }
        .btn-add-entrada:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,162,39,0.4); }

        .entrada-form {
          background: #f8faff; border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md); padding: 14px; margin-bottom: 14px;
        }
        .entrada-form-grid { display: grid; gap: 8px; margin-bottom: 10px; }
        .entrada-form-grid--5 { grid-template-columns: 120px 1fr 72px 1fr 100px; }

        /* Inputs compactos dentro do form de nova entrada */
        .entrada-form .form-group label { font-size: 0.72rem; gap: 4px; }
        .entrada-form .form-group input {
          padding: 7px 9px;
          font-size: 0.8125rem;
        }
        .entrada-form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }

        .historico-lista { display: flex; flex-direction: column; gap: 6px; }

        /* Linha única por entrada */
        .hist-line {
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
          background: var(--color-cream, #fafaf8); border: 1px solid var(--color-border);
          border-radius: var(--radius-md); padding: 7px 10px;
          transition: var(--transition-smooth);
        }
        .hist-line:hover { border-color: var(--color-gold); box-shadow: 0 2px 8px rgba(201,162,39,0.1); }
        .hist-line-desc {
          flex: 1; min-width: 80px;
          font-size: 0.8125rem; color: var(--color-text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .meta-tag {
          display: inline-flex; align-items: center; gap: 3px;
          padding: 2px 8px; border-radius: 99px; font-size: 0.7rem; font-weight: 600;
          white-space: nowrap; flex-shrink: 0;
        }
        .meta-data  { background: #e0f2fe; color: #0369a1; }
        .meta-ref   { background: #f3e8ff; color: #7c3aed; }
        .meta-qty   { background: #fef3c7; color: #92400e; }
        .meta-valor { background: #dcfce7; color: #15803d; }
        .btn-remover {
          background: none; border: none; color: var(--color-text-muted, #9ca3af);
          cursor: pointer; padding: 4px; border-radius: var(--radius-sm);
          display: flex; transition: var(--transition-fast); margin-left: auto; flex-shrink: 0;
        }
        .btn-remover:hover { color: #ef4444; background: #fee2e2; }
        .historico-vazio {
          text-align: center; padding: 24px; color: var(--color-text-muted, #9ca3af);
          font-size: 0.875rem; background: var(--color-cream, #fafaf8);
          border: 1.5px dashed var(--color-border); border-radius: var(--radius-md);
        }

        /* Ações */
        .modal-actions {
          display: flex; justify-content: flex-end; gap: 10px;
          margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--color-border-light);
        }
        .btn-secondary {
          padding: 11px 22px; background: var(--color-cream);
          border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
          font-family: var(--font-body); font-weight: 600; font-size: 0.9rem;
          color: var(--color-text-light); cursor: pointer; transition: var(--transition-smooth);
        }
        .btn-secondary:hover { background: var(--color-border-light); color: var(--color-text); }
        .btn-primary {
          display: flex; align-items: center; gap: 6px; padding: 11px 26px;
          background: linear-gradient(135deg, var(--color-gold) 0%, #a87820 100%);
          border: none; border-radius: var(--radius-md);
          color: var(--color-primary); font-family: var(--font-body);
          font-weight: 700; font-size: 0.9rem; cursor: pointer;
          transition: var(--transition-spring); box-shadow: var(--shadow-gold);
          position: relative; overflow: hidden;
        }
        .btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
          pointer-events: none;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,162,39,0.4); }
        .btn-primary:active { transform: translateY(0); }

        @media (max-width: 640px) {
          .modal-form { padding: 18px; }
          .form-grid { grid-template-columns: 1fr; }
          .entrada-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
