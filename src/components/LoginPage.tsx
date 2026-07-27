import { useState, useEffect } from 'react';
import { Mail, Lock, User, Building2, Eye, EyeOff, LogIn, UserPlus, WifiOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface LoginPageProps {
  onLogin: (token: string, usuario: { id: string; nome: string; email: string; empresaId?: string; papel?: string }) => void;
  onOffline: (nome: string) => void;
}

type Aba = 'login' | 'cadastro';

export function LoginPage({ onLogin, onOffline }: LoginPageProps) {
  const [aba, setAba] = useState<Aba>('login');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginErro, setLoginErro] = useState('');
  const [loginCarregando, setLoginCarregando] = useState(false);

  const [cadNome, setCadNome] = useState('');
  const [cadEmpresa, setCadEmpresa] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadSenhaConf, setCadSenhaConf] = useState('');
  const [cadErro, setCadErro] = useState('');
  const [cadCarregando, setCadCarregando] = useState(false);

  const [nomeOffline, setNomeOffline] = useState('');
  const [mostrarOffline, setMostrarOffline] = useState(false);

  const [verSenhaLogin, setVerSenhaLogin] = useState(false);
  const [verSenhaCad, setVerSenhaCad] = useState(false);
  const [verSenhaConf, setVerSenhaConf] = useState(false);

  const [lembrarDados, setLembrarDados] = useState(() => {
    return localStorage.getItem('somma-saved-email') !== null;
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('somma-saved-email');
    const savedSenha = localStorage.getItem('somma-saved-password');
    if (savedEmail) setLoginEmail(savedEmail);
    if (savedSenha) setLoginSenha(savedSenha);
  }, []);

  const salvarOuLimparDados = (email: string, senha: string, salvar: boolean) => {
    if (salvar) {
      localStorage.setItem('somma-saved-email', email);
      localStorage.setItem('somma-saved-password', senha);
    } else {
      localStorage.removeItem('somma-saved-email');
      localStorage.removeItem('somma-saved-password');
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    fetch(`${API_URL}/api/health`, { signal: controller.signal })
      .then(res => res.ok ? setBackendOnline(true) : setBackendOnline(false))
      .catch(() => setBackendOnline(false))
      .finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErro('');
    setLoginCarregando(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginErro(data.error || 'E-mail ou senha inválidos.'); return; }
      salvarOuLimparDados(loginEmail, loginSenha, lembrarDados);
      onLogin(data.token, data.usuario);
    } catch {
      setLoginErro('Não foi possível conectar ao servidor.');
    } finally {
      setLoginCarregando(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCadErro('');
    if (!cadEmpresa.trim()) { setCadErro('Informe o nome da empresa.'); return; }
    if (cadSenha !== cadSenhaConf) { setCadErro('As senhas não coincidem.'); return; }
    if (cadSenha.length < 6) { setCadErro('A senha deve ter no mínimo 6 caracteres.'); return; }
    setCadCarregando(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: cadNome, empresaNome: cadEmpresa, email: cadEmail, senha: cadSenha }),
      });
      const data = await res.json();
      if (!res.ok) { setCadErro(data.error || 'Erro ao criar conta.'); return; }
      salvarOuLimparDados(cadEmail, cadSenha, lembrarDados);
      onLogin(data.token, data.usuario);
    } catch {
      setCadErro('Não foi possível conectar ao servidor.');
    } finally {
      setCadCarregando(false);
    }
  };

  const handleOffline = (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeOffline.trim()) onOffline(nomeOffline.trim());
  };

  return (
    <div className="lp-root">
      {/* Decorative background orbs */}
      <div className="lp-orb lp-orb1" />
      <div className="lp-orb lp-orb2" />
      <div className="lp-orb lp-orb3" />

      <div className="lp-card">
        {/* ── Header ── */}
        <div className="lp-header">
          <div className="lp-emblem">
            <span>S</span>
          </div>
          <div className="lp-header-text">
            <h1>SOMMA CRM</h1>
            <p>Gestão de demandas do escritório</p>
          </div>
          {backendOnline === false && (
            <div className="lp-offline-pill">
              <WifiOff size={12} /> Servidor offline
            </div>
          )}
        </div>

        {!mostrarOffline && (
          <>
            {/* ── Tabs ── */}
            <div className="lp-tabs">
              <button
                className={`lp-tab ${aba === 'login' ? 'active' : ''}`}
                onClick={() => { setAba('login'); setLoginErro(''); }}
              >
                <LogIn size={14} /> Entrar
              </button>
              <button
                className={`lp-tab ${aba === 'cadastro' ? 'active' : ''}`}
                onClick={() => { setAba('cadastro'); setCadErro(''); }}
              >
                <UserPlus size={14} /> Criar conta
              </button>
              <div className="lp-tab-indicator" style={{ left: aba === 'login' ? '4px' : 'calc(50% + 2px)' }} />
            </div>

            {/* ── Login Form ── */}
            {aba === 'login' && (
              <form onSubmit={handleLogin} className="lp-form">
                <div className="lp-field">
                  <label><Mail size={13} /> E-mail</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                    disabled={loginCarregando}
                  />
                </div>
                <div className="lp-field">
                  <label><Lock size={13} /> Senha</label>
                  <div className="lp-pw-wrap">
                    <input
                      type={verSenhaLogin ? 'text' : 'password'}
                      value={loginSenha}
                      onChange={e => setLoginSenha(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loginCarregando}
                    />
                    <button type="button" className="lp-eye" onClick={() => setVerSenhaLogin(v => !v)} tabIndex={-1}>
                      {verSenhaLogin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {loginErro && <div className="lp-error">{loginErro}</div>}
                <label className="lp-remember">
                  <input
                    type="checkbox"
                    checked={lembrarDados}
                    onChange={e => {
                      setLembrarDados(e.target.checked);
                      if (!e.target.checked) {
                        localStorage.removeItem('somma-saved-email');
                        localStorage.removeItem('somma-saved-password');
                      }
                    }}
                  />
                  Lembrar meus dados
                </label>
                <button type="submit" className="lp-btn-primary" disabled={loginCarregando}>
                  {loginCarregando ? <span className="lp-spinner" /> : <LogIn size={15} />}
                  {loginCarregando ? 'Entrando…' : 'Entrar'}
                </button>
              </form>
            )}

            {/* ── Register Form ── */}
            {aba === 'cadastro' && (
              <form onSubmit={handleCadastro} className="lp-form">
                <div className="lp-field">
                  <label><User size={13} /> Nome completo</label>
                  <input
                    type="text"
                    value={cadNome}
                    onChange={e => setCadNome(e.target.value)}
                    placeholder="Seu nome"
                    required
                    autoFocus
                    disabled={cadCarregando}
                  />
                </div>
                <div className="lp-field">
                  <label><Building2 size={13} /> Nome da empresa</label>
                  <input
                    type="text"
                    value={cadEmpresa}
                    onChange={e => setCadEmpresa(e.target.value)}
                    placeholder="Sua empresa (cria um espaço só seu)"
                    required
                    disabled={cadCarregando}
                  />
                </div>
                <div className="lp-field">
                  <label><Mail size={13} /> E-mail</label>
                  <input
                    type="email"
                    value={cadEmail}
                    onChange={e => setCadEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    disabled={cadCarregando}
                  />
                </div>
                <div className="lp-field">
                  <label><Lock size={13} /> Senha</label>
                  <div className="lp-pw-wrap">
                    <input
                      type={verSenhaCad ? 'text' : 'password'}
                      value={cadSenha}
                      onChange={e => setCadSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={cadCarregando}
                    />
                    <button type="button" className="lp-eye" onClick={() => setVerSenhaCad(v => !v)} tabIndex={-1}>
                      {verSenhaCad ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="lp-field">
                  <label><Lock size={13} /> Confirmar senha</label>
                  <div className="lp-pw-wrap">
                    <input
                      type={verSenhaConf ? 'text' : 'password'}
                      value={cadSenhaConf}
                      onChange={e => setCadSenhaConf(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      disabled={cadCarregando}
                    />
                    <button type="button" className="lp-eye" onClick={() => setVerSenhaConf(v => !v)} tabIndex={-1}>
                      {verSenhaConf ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {cadErro && <div className="lp-error">{cadErro}</div>}
                <button type="submit" className="lp-btn-primary" disabled={cadCarregando}>
                  {cadCarregando ? <span className="lp-spinner" /> : <UserPlus size={15} />}
                  {cadCarregando ? 'Criando conta…' : 'Criar conta'}
                </button>
              </form>
            )}

            {/* ── Offline separator ── */}
            <div className="lp-sep"><span>ou</span></div>
            <button className="lp-btn-offline" onClick={() => setMostrarOffline(true)}>
              <WifiOff size={14} /> Continuar offline
            </button>
          </>
        )}

        {/* ── Offline form ── */}
        {mostrarOffline && (
          <form onSubmit={handleOffline} className="lp-form">
            <div className="lp-offline-notice">
              <WifiOff size={18} />
              <div>
                <strong>Modo offline</strong>
                <p>Os dados ficam apenas neste navegador.</p>
              </div>
            </div>
            <div className="lp-field">
              <label><User size={13} /> Seu nome</label>
              <input
                type="text"
                value={nomeOffline}
                onChange={e => setNomeOffline(e.target.value)}
                placeholder="Ex: João Silva"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="lp-btn-primary">
              <LogIn size={15} /> Entrar offline
            </button>
            <button type="button" className="lp-btn-back" onClick={() => setMostrarOffline(false)}>
              Voltar
            </button>
          </form>
        )}
      </div>

      <style>{`
        /* ── Root / BG ── */
        .lp-root {
          min-height: 100vh;
          background: linear-gradient(150deg, var(--color-primary) 0%, #0d1a2e 45%, var(--color-accent) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Decorative orbs */
        .lp-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .lp-orb1 {
          width: 420px; height: 420px;
          top: -120px; left: -120px;
          background: radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%);
        }

        .lp-orb2 {
          width: 350px; height: 350px;
          bottom: -80px; right: -80px;
          background: radial-gradient(circle, rgba(201,56,90,0.12) 0%, transparent 70%);
        }

        .lp-orb3 {
          width: 200px; height: 200px;
          top: 40%; left: 55%;
          background: radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%);
        }

        /* ── Card ── */
        .lp-card {
          position: relative;
          z-index: 1;
          background: var(--color-white);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 410px;
          box-shadow: 0 36px 72px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06);
          overflow: hidden;
          animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }

        /* ── Header ── */
        .lp-header {
          background: linear-gradient(145deg, var(--color-primary) 0%, #102040 100%);
          padding: 36px 32px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .lp-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='0.04'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .lp-emblem {
          position: relative;
          width: 64px;
          height: 64px;
          background: linear-gradient(145deg, var(--color-gold) 0%, #a87820 100%);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          box-shadow: 0 6px 24px rgba(201,162,39,0.4), inset 0 1px 0 rgba(255,255,255,0.25);
        }

        .lp-emblem span {
          font-family: var(--font-display);
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--color-primary);
          line-height: 1;
        }

        .lp-header-text h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-white);
          letter-spacing: 0.1em;
          margin: 0 0 6px;
        }

        .lp-header-text p {
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem;
          margin: 0;
          font-weight: 400;
        }

        .lp-offline-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 14px;
          padding: 5px 13px;
          background: rgba(224, 56, 78, 0.18);
          border: 1px solid rgba(224, 56, 78, 0.35);
          border-radius: var(--radius-full);
          color: #fca5a5;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* ── Tabs ── */
        .lp-tabs {
          position: relative;
          display: flex;
          border-bottom: 1px solid var(--color-border-light);
          padding: 4px 4px 0;
          background: var(--color-cream);
        }

        .lp-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 8px;
          background: none;
          border: none;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: color 0.2s;
          position: relative;
          z-index: 1;
        }

        .lp-tab.active { color: var(--color-primary); }

        .lp-tab-indicator {
          position: absolute;
          bottom: 0;
          width: calc(50% - 6px);
          height: 2.5px;
          background: var(--color-gold);
          border-radius: 2px 2px 0 0;
          transition: left 0.25s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── Forms ── */
        .lp-form {
          padding: 26px 30px 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lp-field label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .lp-field input {
          padding: 11px 14px;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          font-family: var(--font-body);
          background: var(--color-white);
          color: var(--color-text);
          width: 100%;
          transition: var(--transition-smooth);
        }

        .lp-field input:focus {
          outline: none;
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px var(--color-gold-dim);
        }

        .lp-field input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lp-pw-wrap { position: relative; }
        .lp-pw-wrap input { padding-right: 44px; }

        .lp-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted);
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .lp-eye:hover { color: var(--color-gold); }

        .lp-error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          font-size: 0.8125rem;
          color: var(--color-danger);
          font-weight: 500;
        }

        /* ── Primary button ── */
        .lp-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 24px;
          background: linear-gradient(135deg, var(--color-gold) 0%, #b8891d 100%);
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-primary);
          font-size: 0.9375rem;
          font-weight: 700;
          font-family: var(--font-body);
          cursor: pointer;
          transition: var(--transition-spring);
          box-shadow: var(--shadow-gold);
          margin-top: 4px;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
        }

        .lp-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
          pointer-events: none;
        }

        .lp-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201,162,39,0.45);
        }

        .lp-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .lp-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .lp-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(20,20,40,0.2);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* ── Separator ── */
        .lp-sep {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 30px;
          margin-bottom: -6px;
        }

        .lp-sep::before,
        .lp-sep::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--color-border-light);
        }

        .lp-sep span {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }

        /* ── Offline button ── */
        .lp-btn-offline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 0 30px 26px;
          padding: 11px 20px;
          background: var(--color-cream);
          border: 1.5px dashed var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-light);
          font-size: 0.875rem;
          font-weight: 600;
          font-family: var(--font-body);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .lp-btn-offline:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
          background: rgba(201,162,39,0.05);
        }

        /* ── Offline notice ── */
        .lp-offline-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: var(--radius-md);
          color: #78350f;
        }

        .lp-offline-notice strong {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 2px;
        }

        .lp-offline-notice p {
          font-size: 0.8125rem;
          margin: 0;
          opacity: 0.8;
        }

        .lp-btn-back {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 0.875rem;
          font-family: var(--font-body);
          cursor: pointer;
          text-align: center;
          padding: 4px;
          text-decoration: underline;
          transition: color 0.15s;
        }

        .lp-btn-back:hover { color: var(--color-gold); }

        /* ── Remember me ── */
        .lp-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--color-text-muted);
          cursor: pointer;
          user-select: none;
        }

        .lp-remember input[type="checkbox"] {
          width: 15px;
          height: 15px;
          accent-color: var(--color-gold);
          cursor: pointer;
          flex-shrink: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .lp-card { border-radius: var(--radius-lg); }
          .lp-header { padding: 28px 24px 22px; }
          .lp-form { padding: 22px 22px 18px; }
          .lp-sep { padding: 0 22px; }
          .lp-btn-offline { margin: 0 22px 22px; }
        }
      `}</style>
    </div>
  );
}
