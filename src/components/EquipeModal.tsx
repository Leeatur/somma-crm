import { useState, useEffect, useCallback } from 'react';
import { X, Users, UserPlus, Trash2, Crown, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Membro {
  id: string;
  nome: string;
  email: string;
  papel: string;
}

interface EquipeModalProps {
  token: string | null;
  usuarioId: string;
  podeGerenciar: boolean;
  onFechar: () => void;
}

export function EquipeModal({ token, usuarioId, podeGerenciar, onFechar }: EquipeModalProps) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const headers = useCallback((): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const carregar = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/equipe`, { headers: headers() });
      if (res.ok) setMembros(await res.json());
    } catch { /* ignore */ }
    finally { setCarregando(false); }
  }, [headers]);

  useEffect(() => { carregar(); }, [carregar]);

  const adicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (senha.length < 6) { setErro('A senha deve ter no mínimo 6 caracteres.'); return; }
    setSalvando(true);
    try {
      const res = await fetch(`${API_URL}/api/equipe`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || 'Erro ao adicionar pessoa.'); return; }
      setNome(''); setEmail(''); setSenha('');
      await carregar();
    } catch {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (m: Membro) => {
    if (!confirm(`Remover ${m.nome} da equipe? A pessoa perde o acesso.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/equipe/${m.id}`, { method: 'DELETE', headers: headers() });
      if (res.ok) setMembros(prev => prev.filter(x => x.id !== m.id));
      else { const d = await res.json(); alert(d.error || 'Erro ao remover.'); }
    } catch { alert('Erro ao remover.'); }
  };

  return (
    <div className="eq-overlay" onClick={onFechar}>
      <div className="eq-modal" onClick={e => e.stopPropagation()}>
        <div className="eq-header">
          <div className="eq-title">
            <div className="eq-icon"><Users size={22} /></div>
            <div>
              <h2>Equipe</h2>
              <p>Quem acessa o kanban da sua empresa</p>
            </div>
          </div>
          <button className="eq-close" onClick={onFechar}><X size={22} /></button>
        </div>

        <div className="eq-body">
          {podeGerenciar && (
            <form className="eq-add" onSubmit={adicionar}>
              <div className="eq-add-title"><UserPlus size={15} /> Adicionar pessoa</div>
              <div className="eq-add-grid">
                <div className="eq-field"><UserIcon size={13} /><input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" required disabled={salvando} /></div>
                <div className="eq-field"><Mail size={13} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" required disabled={salvando} /></div>
                <div className="eq-field"><Lock size={13} /><input type="text" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha (mín. 6)" required disabled={salvando} /></div>
                <button type="submit" className="eq-add-btn" disabled={salvando}>
                  {salvando ? <Loader2 size={15} className="eq-spin" /> : <UserPlus size={15} />} Adicionar
                </button>
              </div>
              {erro && <div className="eq-erro">{erro}</div>}
              <div className="eq-dica">Passe o e-mail e a senha para a pessoa. Ela entra pela tela de login normal e vê o mesmo quadro.</div>
            </form>
          )}

          <div className="eq-lista-title">Pessoas com acesso ({membros.length})</div>
          {carregando ? (
            <div className="eq-vazio"><Loader2 size={18} className="eq-spin" /> Carregando…</div>
          ) : (
            <div className="eq-lista">
              {membros.map(m => (
                <div key={m.id} className="eq-linha">
                  <div className="eq-avatar">{m.nome.charAt(0).toUpperCase()}</div>
                  <div className="eq-info">
                    <span className="eq-nome">{m.nome}{m.id === usuarioId && <span className="eq-voce">você</span>}</span>
                    <span className="eq-email">{m.email}</span>
                  </div>
                  {m.papel === 'dono' ? (
                    <span className="eq-badge-dono"><Crown size={12} /> Dono</span>
                  ) : (
                    <span className="eq-badge-membro">Membro</span>
                  )}
                  {podeGerenciar && m.id !== usuarioId && m.papel !== 'dono' && (
                    <button className="eq-del" onClick={() => remover(m)} title="Remover"><Trash2 size={15} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="eq-actions">
          <button type="button" className="eq-btn-sec" onClick={onFechar}>Fechar</button>
        </div>
      </div>

      <style>{`
        .eq-overlay { position: fixed; inset: 0; background: rgba(14,18,32,0.72); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; z-index: 1200; padding: 20px; animation: fadeInFast 0.2s ease-out; }
        .eq-modal { background: var(--color-white); border-radius: var(--radius-xl); width: 100%; max-width: 620px; max-height: 90vh;
          overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--shadow-xl), 0 0 0 1px rgba(255,255,255,0.08);
          animation: scaleIn 0.3s cubic-bezier(0.34,1.2,0.64,1); }
        .eq-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; flex-shrink: 0;
          background: linear-gradient(145deg, var(--color-primary) 0%, #102040 100%); }
        .eq-title { display: flex; align-items: center; gap: 13px; }
        .eq-icon { width: 44px; height: 44px; border-radius: var(--radius-md); flex-shrink: 0;
          background: linear-gradient(145deg, #f97316 0%, #c2410c 100%); color: #fff; display: flex; align-items: center; justify-content: center; }
        .eq-title h2 { font-family: var(--font-display); font-size: 1.3rem; color: #fff; margin: 0; }
        .eq-title p { color: rgba(255,255,255,0.55); font-size: 0.78rem; margin: 2px 0 0; }
        .eq-close { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7);
          cursor: pointer; padding: 7px; border-radius: var(--radius-sm); display: flex; }
        .eq-close:hover { background: rgba(255,255,255,0.18); color: #fff; }
        .eq-body { padding: 20px 24px; overflow-y: auto; }
        .eq-add { background: var(--color-cream); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px; }
        .eq-add-title { display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: 0.82rem; color: var(--color-primary); margin-bottom: 11px; }
        .eq-add-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 8px; align-items: center; }
        .eq-field { display: flex; align-items: center; gap: 6px; background: #fff; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); padding: 0 10px; color: var(--color-text-muted); }
        .eq-field:focus-within { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .eq-field input { border: none; outline: none; padding: 9px 0; font-size: 0.85rem; font-family: var(--font-body); color: var(--color-text); background: none; width: 100%; }
        .eq-add-btn { display: flex; align-items: center; gap: 6px; padding: 9px 15px; background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
          border: none; border-radius: var(--radius-sm); color: #fff; font-weight: 700; font-size: 0.82rem; cursor: pointer; white-space: nowrap; }
        .eq-add-btn:hover:not(:disabled) { box-shadow: 0 5px 16px rgba(249,115,22,0.4); }
        .eq-add-btn:disabled { opacity: 0.6; cursor: default; }
        .eq-erro { margin-top: 10px; background: #fff1f2; border: 1px solid #fecdd3; color: var(--color-danger); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; }
        .eq-dica { margin-top: 10px; font-size: 0.75rem; color: var(--color-text-light); line-height: 1.5; }
        .eq-lista-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin-bottom: 10px; }
        .eq-lista { display: flex; flex-direction: column; gap: 7px; }
        .eq-linha { display: flex; align-items: center; gap: 11px; background: var(--color-cream); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 9px 12px; }
        .eq-avatar { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(145deg, var(--color-primary), #1a4a82); color: #fff; font-weight: 800; font-size: 0.85rem; }
        .eq-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .eq-nome { font-size: 0.88rem; font-weight: 600; color: var(--color-text); display: flex; align-items: center; gap: 7px; }
        .eq-voce { font-size: 0.62rem; font-weight: 700; background: #dbeafe; color: #1e40af; padding: 1px 7px; border-radius: 99px; text-transform: uppercase; }
        .eq-email { font-size: 0.75rem; color: var(--color-text-muted); }
        .eq-badge-dono { display: inline-flex; align-items: center; gap: 4px; font-size: 0.68rem; font-weight: 800; background: #fef3c7; color: #92400e; padding: 3px 9px; border-radius: 99px; flex-shrink: 0; }
        .eq-badge-membro { font-size: 0.68rem; font-weight: 700; background: var(--color-border-light); color: var(--color-text-light); padding: 3px 9px; border-radius: 99px; flex-shrink: 0; }
        .eq-del { background: none; border: none; color: var(--color-text-muted); cursor: pointer; padding: 6px; border-radius: var(--radius-sm); display: flex; flex-shrink: 0; }
        .eq-del:hover { color: #ef4444; background: #fee2e2; }
        .eq-vazio { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 26px; color: var(--color-text-muted); font-size: 0.85rem; }
        .eq-spin { animation: spin 0.9s linear infinite; }
        .eq-actions { display: flex; justify-content: flex-end; padding: 14px 24px; border-top: 1px solid var(--color-border-light); flex-shrink: 0; }
        .eq-btn-sec { padding: 10px 20px; background: var(--color-cream); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-weight: 600; font-size: 0.88rem; color: var(--color-text-light); cursor: pointer; }
        .eq-btn-sec:hover { background: var(--color-border-light); }
        @media (max-width: 560px) { .eq-add-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
