import { useState, useRef, useEffect } from 'react';
import type { Demanda } from '../types';
import { TIPOS_PROBLEMA, STATUS_SITUACAO, PRIORIDADES, CORES_PRIORIDADE } from '../types';
import { X, Calendar, User, Building2, AlertCircle, ArrowRight, FileText, Package, CheckCircle2, Briefcase, Store, Phone, MapPin } from 'lucide-react';

interface ModalDemandaProps {
  demanda?: Demanda | null;
  onSalvar: (demanda: Partial<Demanda>) => void;
  onFechar: () => void;
  isEditando?: boolean;
}

export function ModalDemanda({ demanda, onSalvar, onFechar, isEditando = false }: ModalDemandaProps) {
  const [formData, setFormData] = useState<Partial<Demanda>>({
    nomeCliente: demanda?.nomeCliente || '',
    razaoSocial: demanda?.razaoSocial || '',
    fantasia: demanda?.fantasia || '',
    contato: demanda?.contato || '',
    cidade: demanda?.cidade || '',
    marca: demanda?.marca || '',
    dataContato: demanda?.dataContato || new Date().toISOString().split('T')[0],
    tipoProblema: demanda?.tipoProblema || 'devolucao_defeito',
    encaminhadoPara: demanda?.encaminhadoPara || '',
    status: demanda?.status || 'pendente',
    prioridade: demanda?.prioridade || 'media',
    observacoes: demanda?.observacoes || '',
    numeroNFDevolucao: demanda?.numeroNFDevolucao || '',
    dataRecebimentoNF: demanda?.dataRecebimentoNF || '',
  });
  
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Set initial content only once when modal opens
  useEffect(() => {
    if (editorRef.current && isInitialMount.current) {
      isInitialMount.current = false;
      if (formData.observacoes) {
        editorRef.current.innerHTML = formData.observacoes;
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(formData);
    onFechar();
  };

  const formatRichText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    // Update formData with current content after formatting
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, observacoes: editorRef.current?.innerHTML || '' }));
    }
  };
  
  const handleEditorInput = () => {
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, observacoes: editorRef.current?.innerHTML || '' }));
    }
  };

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
            <div className="form-group">
              <label>
                <User size={16} />
                Nome do Cliente *
              </label>
              <input
                type="text"
                value={formData.nomeCliente}
                onChange={e => setFormData({ ...formData, nomeCliente: e.target.value })}
                placeholder="Digite o nome do cliente"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Briefcase size={16} />
                Razão Social
              </label>
              <input
                type="text"
                value={formData.razaoSocial}
                onChange={e => setFormData({ ...formData, razaoSocial: e.target.value })}
                placeholder="Razão social da empresa"
              />
            </div>

            <div className="form-group">
              <label>
                <Store size={16} />
                Fantasia
              </label>
              <input
                type="text"
                value={formData.fantasia}
                onChange={e => setFormData({ ...formData, fantasia: e.target.value })}
                placeholder="Nome fantasia"
              />
            </div>

            <div className="form-group">
              <label>
                <Building2 size={16} />
                Marca *
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={e => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Digite a marca"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Phone size={16} />
                Contato
              </label>
              <input
                type="text"
                value={formData.contato}
                onChange={e => setFormData({ ...formData, contato: e.target.value })}
                placeholder="Telefone ou email de contato"
              />
            </div>

            <div className="form-group">
              <label>
                <MapPin size={16} />
                Cidade
              </label>
              <input
                type="text"
                value={formData.cidade}
                onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                placeholder="Cidade do cliente"
              />
            </div>

            <div className="form-group">
              <label>
                <Calendar size={16} />
                Data do Contato *
              </label>
              <input
                type="date"
                value={formData.dataContato}
                onChange={e => setFormData({ ...formData, dataContato: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <AlertCircle size={16} />
                Tipo do Problema *
              </label>
              <select
                value={formData.tipoProblema}
                onChange={e => setFormData({ ...formData, tipoProblema: e.target.value as any })}
                required
              >
                {Object.entries(TIPOS_PROBLEMA).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <ArrowRight size={16} />
                Encaminhado Para *
              </label>
              <input
                type="text"
                value={formData.encaminhadoPara}
                onChange={e => setFormData({ ...formData, encaminhadoPara: e.target.value })}
                placeholder="Para quem foi encaminhado"
                required
              />
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                required
              >
                {Object.entries(STATUS_SITUACAO).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Prioridade *</label>
              <div className="prioridade-options">
                {(Object.keys(PRIORIDADES) as Array<keyof typeof PRIORIDADES>).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`prioridade-btn ${formData.prioridade === p ? 'active' : ''}`}
                    style={{ 
                      '--prioridade-color': CORES_PRIORIDADE[p] 
                    } as React.CSSProperties}
                    onClick={() => setFormData({ ...formData, prioridade: p })}
                  >
                    {PRIORIDADES[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(formData.status === 'solicitacao_nf_devolucao' || formData.status === 'nf_enviada_cliente') && (
            <div className="form-grid nf-section">
              <div className="form-group">
                <label>
                  <FileText size={16} />
                  Número da NF de Devolução
                </label>
                <input
                  type="text"
                  value={formData.numeroNFDevolucao}
                  onChange={e => setFormData({ ...formData, numeroNFDevolucao: e.target.value })}
                  placeholder="Número da nota fiscal"
                />
              </div>

              <div className="form-group">
                <label>Data de Recebimento da NF</label>
                <input
                  type="date"
                  value={formData.dataRecebimentoNF}
                  onChange={e => setFormData({ ...formData, dataRecebimentoNF: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="form-group rich-text-group">
            <label>Observações</label>
            <div className="rich-text-toolbar">
              <button type="button" onClick={() => formatRichText('bold')} title="Negrito"><strong>B</strong></button>
              <button type="button" onClick={() => formatRichText('italic')} title="Itálico"><em>I</em></button>
              <button type="button" onClick={() => formatRichText('underline')} title="Sublinhado"><u>U</u></button>
              <button type="button" onClick={() => formatRichText('insertUnorderedList')} title="Lista">• Lista</button>
              <button type="button" onClick={() => formatRichText('insertOrderedList')} title="Numerada">1. Lista</button>
            </div>
            <div
              ref={editorRef}
              className="rich-text-editor"
              contentEditable
              onInput={handleEditorInput}
              data-placeholder="Digite as observações..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditando ? 'Salvar Alterações' : 'Criar Demanda'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 26, 46, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          animation: slideIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          color: var(--color-white);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .modal-icon {
          width: 48px;
          height: 48px;
          background: var(--color-gold);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
        }

        .modal-title h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-white);
          margin: 0;
        }

        .modal-title p {
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          margin: 4px 0 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--color-white);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-sm);
          transition: background 0.2s;
        }

        .modal-close:hover {
          background: rgba(255,255,255,0.1);
        }

        .modal-form {
          padding: 28px;
          overflow-y: auto;
          max-height: calc(90vh - 100px);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .nf-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 20px;
          border-radius: var(--radius-md);
          border: 1px solid #f59e0b;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.rich-text-group {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-text);
        }

        .form-group input,
        .form-group select {
          padding: 12px 16px;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          font-family: var(--font-body);
          transition: all 0.2s;
          background: var(--color-white);
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(15, 52, 96, 0.1);
        }

        .prioridade-options {
          display: flex;
          gap: 8px;
        }

        .prioridade-btn {
          flex: 1;
          padding: 10px 16px;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-white);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .prioridade-btn:hover {
          border-color: var(--prioridade-color);
          color: var(--prioridade-color);
        }

        .prioridade-btn.active {
          background: var(--prioridade-color);
          border-color: var(--prioridade-color);
          color: white;
        }

        .rich-text-toolbar {
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          background: var(--color-cream);
          border: 2px solid var(--color-border);
          border-bottom: none;
          border-radius: var(--radius-md) var(--radius-md) 0 0;
        }

        .rich-text-toolbar button {
          padding: 6px 12px;
          background: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .rich-text-toolbar button:hover {
          background: var(--color-accent);
          color: var(--color-white);
          border-color: var(--color-accent);
        }

        .rich-text-editor {
          min-height: 150px;
          padding: 16px;
          border: 2px solid var(--color-border);
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          font-size: 0.9375rem;
          line-height: 1.6;
          background: var(--color-white);
        }

        .rich-text-editor:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        .rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: var(--color-text-light);
          font-style: italic;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--color-border);
        }

        .btn-secondary {
          padding: 12px 24px;
          background: var(--color-cream);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--color-border);
        }

        .btn-primary {
          padding: 12px 28px;
          background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-highlight) 100%);
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-white);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: var(--shadow-md);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .prioridade-options {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
