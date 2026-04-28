import { useState, useCallback } from 'react';
import type { AuthUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'somma-auth-token';
const USUARIO_KEY = 'somma-usuario';

function lerTokenStorage(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function lerUsuarioStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USUARIO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Suporte ao formato antigo (string simples) — converte para AuthUser offline
    if (typeof parsed === 'string') {
      return { id: 'offline', nome: parsed, email: '' };
    }
    return parsed as AuthUser;
  } catch {
    return null;
  }
}

function salvarSessao(token: string, usuario: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

function limparSessao(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(lerTokenStorage);
  const [usuario, setUsuario] = useState<AuthUser | null>(lerUsuarioStorage);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const login = useCallback(async (email: string, senha: string): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Erro ao fazer login.');
        return false;
      }
      salvarSessao(data.token, data.usuario);
      setToken(data.token);
      setUsuario(data.usuario);
      return true;
    } catch {
      setErro('Backend indisponível. Use o acesso offline.');
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  const register = useCallback(async (nome: string, email: string, senha: string): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Erro ao criar conta.');
        return false;
      }
      salvarSessao(data.token, data.usuario);
      setToken(data.token);
      setUsuario(data.usuario);
      return true;
    } catch {
      setErro('Backend indisponível. Não é possível criar conta offline.');
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  const entrarOffline = useCallback((nome: string): void => {
    const usuarioOffline: AuthUser = { id: 'offline', nome, email: '' };
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuarioOffline));
    setToken(null);
    setUsuario(usuarioOffline);
  }, []);

  const logout = useCallback((): void => {
    limparSessao();
    setToken(null);
    setUsuario(null);
    setErro(null);
  }, []);

  const verificarToken = useCallback(async (): Promise<AuthUser | null> => {
    const t = lerTokenStorage();
    if (!t) return null;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) {
        limparSessao();
        setToken(null);
        setUsuario(null);
        return null;
      }
      const data = await res.json();
      return data.usuario as AuthUser;
    } catch {
      return null;
    }
  }, []);

  const limparErro = useCallback((): void => setErro(null), []);

  return {
    usuario,
    token,
    carregando,
    erro,
    login,
    register,
    entrarOffline,
    logout,
    verificarToken,
    limparErro,
  };
}
