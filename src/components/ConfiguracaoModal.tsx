import { useState } from 'react';
import type { EmpresaConfig, ColunaDef, CampoDef, CampoTipo } from '../types';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Settings2, Save, Columns3, ListChecks, Lock } from 'lucide-react';

interface ConfiguracaoModalProps {
  config: EmpresaConfig;
  podeEditar: boolean;
  onSalvar: (dados: { colunas: ColunaDef[]; camposDemanda: CampoDef[] }) => Promise<void> | void;
  onFechar: () => void;
}

const CORES_SUGERIDAS = [
  '#f97316', '#ec4899', '#a78bfa', '#f59e0b', '#dc2626',
  '#ea580c', '#059669', '#0ea5e9', '#8b5cf6', '#64748b',
];

const TIPOS: { valor: CampoTipo; label: string }[] = [
  { valor: 'texto', label: 'Texto' },
  { valor: 'numero', label: 'Número' },
  { valor: 'data', label: 'Data' },
  { valor: 'moeda', label: 'Moeda (R$)' },
  { valor: 'selecao', label: 'Lista de opções' },
];

function slug(s: string): string {
  return (
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  ) || 'campo';
}

export function ConfiguracaoModal({ config, podeEditar, onSalvar, onFechar }: ConfiguracaoModalProps) {
  const [aba, setAba] = useState<'colunas' | 'campos'>('colunas');
  const [colunas, setColunas] = useState<ColunaDef[]>(
    (config.colunas || []).map((c, i) => ({ ...c, ordem: i }))
  );
  const [campos, setCampos] = useState<CampoDef[]>(
    (config.camposDemanda || []).map((c, i) => ({ ...c, ordem: i, opcoes: c.opcoes || [] }))
  );
  const [salvando, setSalvando] = useState(false);

  // ── Colunas ──
  const upCol = (idx: number, campo: Partial<ColunaDef>) =>
    setColunas(prev => prev.map((c, i) => (i === idx ? { ...c, ...campo } : c)));
  const rmCol = (idx: number) => setColunas(prev => prev.filter((_, i) => i !== idx));
  const moveCol = (idx: number, dir: -1 | 1) => setColunas(prev => reordenar(prev, idx, dir));
  const addCol = () =>
    setColunas(prev => [...prev, { id: '', titulo: '', cor: CORES_SUGERIDAS[prev.length % CORES_SUGERIDAS.length] }]);

  // ── Campos ──
  const upCampo = (idx: number, dados: Partial<CampoDef>) =>
    setCampos(prev => prev.map((c, i) => (i === idx ? { ...c, ...dados } : c)));
  const rmCampo = (idx: number) => setCampos(prev => prev.filter((_, i) => i !== idx));
  const moveCampo = (idx: number, dir: -1 | 1) => setCampos(prev => reordenar(prev, idx, dir));
  const addCampo = () =>
    setCampos(prev => [...prev, { key: '', label: '', tipo: 'texto', obrigatorio: false, ativo: true, opcoes: [] }]);

  function reordenar<T>(arr: T[], idx: number, dir: -1 | 1): T[] {
    const novo = [...arr];
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= novo.length) return arr;
    [novo[idx], novo[alvo]] = [novo[alvo], novo[idx]];
    return novo;
  }

  const handleSalvar = async () => {
    const colsValidas = colunas.filter(c => c.titulo.trim());
    if (colsValidas.length === 0) { alert('Adicione pelo menos uma coluna com nome.'); setAba('colunas'); return; }

    const usadosCol = new Set<string>();
    const colunasFinais: ColunaDef[] = colsValidas.map((c, i) => {
      let id = c.id || slug(c.titulo);
      while (usadosCol.has(id)) id = `${id}_${i}`;
      usadosCol.add(id);
      return { id, titulo: c.titulo.trim(), cor: c.cor || '#64748b', ordem: i };
    });

    const usadosCampo = new Set<string>();
    const camposFinais: CampoDef[] = campos.filter(c => c.label.trim()).map((c, i) => {
      let key = c.key || slug(c.label);
      while (usadosCampo.has(key)) key = `${key}_${i}`;
      usadosCampo.add(key);
      return {
        key,
        label: c.label.trim(),
        tipo: c.tipo || 'texto',
        obrigatorio: key === 'nomeCliente' ? true : !!c.obrigatorio,
        ordem: i,
        ativo: true,
        opcoes: c.tipo === 'selecao' ? (c.opcoes || []).map(o => o.trim()).filter(Boolean) : [],
      };
    });
    // Garante o campo "Cliente" (título do card) sempre presente
    if (!camposFinais.some(c => c.key === 'nomeCliente')) {
      camposFinais.unshift({ key: 'nomeCliente', label: 'Cliente', tipo: 'texto', obrigatorio: true, ordem: -1, ativo: true, opcoes: [] });
    }

    setSalvando(true);
    try {
      await onSalvar({ colunas: colunasFinais, camposDemanda: camposFinais });
      onFechar();
    } catch {
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="cfg-overlay" onClick={onFechar}>
      <div className="cfg-modal" onClick={e => e.stopPropagation()}>
        <div className="cfg-header">
          <div className="cfg-title">
            <div className="cfg-icon"><Settings2 size={22} /></div>
            <div>
              <h2>Configurar Demandas</h2>
              <p>Personalize as colunas e os campos do seu jeito</p>
            </div>
          </div>
          <button className="cfg-close" onClick={onFechar}><X size={22} /></button>
        </div>

        <div className="cfg-tabs">
          <button className={`cfg-tab ${aba === 'colunas' ? 'ativa' : ''}`} onClick={() => setAba('colunas')}>
            <Columns3 size={15} /> Colunas
          </button>
          <button className={`cfg-tab ${aba === 'campos' ? 'ativa' : ''}`} onClick={() => setAba('campos')}>
            <ListChecks size={15} /> Campos
          </button>
        </div>

        <div className="cfg-body">
          {!podeEditar && (
            <div className="cfg-aviso">Apenas o dono da empresa pode alterar a configuração.</div>
          )}

          {aba === 'colunas' && (
            <>
              <div className="cfg-lista">
                {colunas.map((col, idx) => (
                  <div key={idx} className="cfg-linha">
                    <div className="cfg-mover">
                      <button type="button" onClick={() => moveCol(idx, -1)} disabled={idx === 0 || !podeEditar}><ArrowUp size={13} /></button>
                      <button type="button" onClick={() => moveCol(idx, 1)} disabled={idx === colunas.length - 1 || !podeEditar}><ArrowDown size={13} /></button>
                    </div>
                    <input type="color" className="cfg-cor" value={col.cor || '#64748b'} onChange={e => upCol(idx, { cor: e.target.value })} disabled={!podeEditar} title="Cor" />
                    <input type="text" className="cfg-nome" value={col.titulo} onChange={e => upCol(idx, { titulo: e.target.value })} placeholder="Nome da coluna (ex.: Aguardando Pagamento)" disabled={!podeEditar} />
                    <button type="button" className="cfg-del" onClick={() => rmCol(idx)} disabled={!podeEditar} title="Remover"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
              {podeEditar && (
                <button type="button" className="cfg-add" onClick={addCol}><Plus size={15} /> Adicionar coluna</button>
              )}
              <div className="cfg-dica">💡 Demandas numa coluna removida ficam ocultas até você movê-las. Renomear/trocar a cor não afeta as demandas.</div>
            </>
          )}

          {aba === 'campos' && (
            <>
              <div className="cfg-lista">
                {campos.map((campo, idx) => {
                  const travado = campo.key === 'nomeCliente';
                  return (
                    <div key={idx} className="cfg-campo">
                      <div className="cfg-campo-top">
                        <div className="cfg-mover">
                          <button type="button" onClick={() => moveCampo(idx, -1)} disabled={idx === 0 || !podeEditar}><ArrowUp size={13} /></button>
                          <button type="button" onClick={() => moveCampo(idx, 1)} disabled={idx === campos.length - 1 || !podeEditar}><ArrowDown size={13} /></button>
                        </div>
                        <input type="text" className="cfg-nome" value={campo.label} onChange={e => upCampo(idx, { label: e.target.value })} placeholder="Nome do campo (ex.: Prazo de entrega)" disabled={!podeEditar} />
                        <select className="cfg-tipo" value={campo.tipo} onChange={e => upCampo(idx, { tipo: e.target.value as CampoTipo })} disabled={!podeEditar}>
                          {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
                        </select>
                        <label className={`cfg-obrig ${travado ? 'travado' : ''}`} title={travado ? 'Sempre obrigatório' : 'Obrigatório'}>
                          <input type="checkbox" checked={travado ? true : !!campo.obrigatorio} onChange={e => upCampo(idx, { obrigatorio: e.target.checked })} disabled={!podeEditar || travado} />
                          obrig.
                        </label>
                        {travado ? (
                          <span className="cfg-lock" title="Campo fixo (título do card)"><Lock size={14} /></span>
                        ) : (
                          <button type="button" className="cfg-del" onClick={() => rmCampo(idx)} disabled={!podeEditar} title="Remover"><Trash2 size={15} /></button>
                        )}
                      </div>
                      {campo.tipo === 'selecao' && (
                        <input
                          type="text"
                          className="cfg-opcoes"
                          value={(campo.opcoes || []).join(', ')}
                          onChange={e => upCampo(idx, { opcoes: e.target.value.split(',').map(o => o.replace(/^\s+/, '')) })}
                          placeholder="Opções separadas por vírgula (ex.: Pequeno, Médio, Grande)"
                          disabled={!podeEditar}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {podeEditar && (
                <button type="button" className="cfg-add" onClick={addCampo}><Plus size={15} /> Adicionar campo</button>
              )}
              <div className="cfg-dica">💡 "Cliente" é fixo (é o título do card). Campos novos aparecem no formulário e no fichário de cada demanda.</div>
            </>
          )}
        </div>

        <div className="cfg-actions">
          <button type="button" className="cfg-btn-sec" onClick={onFechar}>Cancelar</button>
          {podeEditar && (
            <button type="button" className="cfg-btn-pri" onClick={handleSalvar} disabled={salvando}>
              <Save size={15} /> {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .cfg-overlay { position: fixed; inset: 0; background: rgba(14,18,32,0.72); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; z-index: 1200; padding: 20px; animation: fadeInFast 0.2s ease-out; }
        .cfg-modal { background: var(--color-white); border-radius: var(--radius-xl); width: 100%; max-width: 720px; max-height: 90vh;
          overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--shadow-xl), 0 0 0 1px rgba(255,255,255,0.08);
          animation: scaleIn 0.3s cubic-bezier(0.34,1.2,0.64,1); }
        .cfg-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; flex-shrink: 0;
          background: linear-gradient(145deg, var(--color-primary) 0%, #102040 100%); }
        .cfg-title { display: flex; align-items: center; gap: 13px; }
        .cfg-icon { width: 44px; height: 44px; border-radius: var(--radius-md); flex-shrink: 0;
          background: linear-gradient(145deg, #f97316 0%, #c2410c 100%); color: #fff; display: flex; align-items: center; justify-content: center; }
        .cfg-title h2 { font-family: var(--font-display); font-size: 1.3rem; color: #fff; margin: 0; }
        .cfg-title p { color: rgba(255,255,255,0.55); font-size: 0.78rem; margin: 2px 0 0; }
        .cfg-close { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7);
          cursor: pointer; padding: 7px; border-radius: var(--radius-sm); display: flex; }
        .cfg-close:hover { background: rgba(255,255,255,0.18); color: #fff; }
        .cfg-tabs { display: flex; gap: 4px; padding: 12px 24px 0; background: var(--color-cream); flex-shrink: 0; border-bottom: 1px solid var(--color-border-light); }
        .cfg-tab { display: flex; align-items: center; gap: 6px; padding: 9px 16px; background: none; border: none; cursor: pointer;
          font-size: 0.85rem; font-weight: 700; color: var(--color-text-muted); border-bottom: 2.5px solid transparent; }
        .cfg-tab.ativa { color: #ea580c; border-bottom-color: #ea580c; }
        .cfg-body { padding: 20px 24px; overflow-y: auto; }
        .cfg-aviso { background: #fffbeb; border: 1px solid #fcd34d; color: #78350f; padding: 9px 13px; border-radius: var(--radius-md); font-size: 0.82rem; margin-bottom: 16px; }
        .cfg-lista { display: flex; flex-direction: column; gap: 8px; }
        .cfg-linha { display: flex; align-items: center; gap: 8px; background: var(--color-cream); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 7px 9px; }
        .cfg-campo { background: var(--color-cream); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 8px 9px; }
        .cfg-campo-top { display: flex; align-items: center; gap: 8px; }
        .cfg-mover { display: flex; flex-direction: column; gap: 1px; }
        .cfg-mover button { background: none; border: none; cursor: pointer; color: var(--color-text-muted); padding: 1px; display: flex; border-radius: 3px; }
        .cfg-mover button:hover:not(:disabled) { color: var(--color-primary); background: rgba(0,0,0,0.05); }
        .cfg-mover button:disabled { opacity: 0.3; cursor: default; }
        .cfg-cor { width: 34px; height: 34px; padding: 0; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; flex-shrink: 0; background: none; }
        .cfg-nome { flex: 1; min-width: 0; padding: 8px 11px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm);
          font-size: 0.875rem; font-family: var(--font-body); color: var(--color-text); background: #fff; }
        .cfg-nome:focus, .cfg-tipo:focus, .cfg-opcoes:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .cfg-tipo { padding: 8px 8px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.8rem; background: #fff; color: var(--color-text); cursor: pointer; flex-shrink: 0; }
        .cfg-obrig { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 600; color: var(--color-text-light); flex-shrink: 0; cursor: pointer; }
        .cfg-obrig.travado { opacity: 0.6; cursor: default; }
        .cfg-opcoes { margin-top: 7px; width: 100%; padding: 7px 10px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.8rem; background: #fff; color: var(--color-text); }
        .cfg-del { background: none; border: none; color: var(--color-text-muted); cursor: pointer; padding: 6px; border-radius: var(--radius-sm); display: flex; flex-shrink: 0; }
        .cfg-del:hover:not(:disabled) { color: #ef4444; background: #fee2e2; }
        .cfg-del:disabled { opacity: 0.3; cursor: default; }
        .cfg-lock { color: var(--color-text-muted); padding: 6px; display: flex; flex-shrink: 0; }
        .cfg-add { display: flex; align-items: center; gap: 6px; margin-top: 12px; background: none; border: 1.5px dashed var(--color-border);
          color: var(--color-text-light); padding: 9px 15px; border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 600; cursor: pointer; width: 100%; justify-content: center; transition: var(--transition-smooth); }
        .cfg-add:hover { border-color: #f97316; color: #ea580c; background: rgba(249,115,22,0.05); }
        .cfg-dica { margin-top: 16px; font-size: 0.76rem; color: var(--color-text-light); background: var(--color-cream); border-radius: var(--radius-md); padding: 10px 13px; line-height: 1.5; }
        .cfg-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--color-border-light); flex-shrink: 0; }
        .cfg-btn-sec { padding: 10px 20px; background: var(--color-cream); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-weight: 600; font-size: 0.88rem; color: var(--color-text-light); cursor: pointer; }
        .cfg-btn-sec:hover { background: var(--color-border-light); }
        .cfg-btn-pri { display: flex; align-items: center; gap: 7px; padding: 10px 22px; background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
          border: none; border-radius: var(--radius-md); color: #fff; font-weight: 700; font-size: 0.88rem; cursor: pointer; }
        .cfg-btn-pri:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(249,115,22,0.4); }
        .cfg-btn-pri:disabled { opacity: 0.6; cursor: default; }
      `}</style>
    </div>
  );
}
