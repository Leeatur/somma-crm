import { useState } from 'react';
import { User, LogIn } from 'lucide-react';

interface ModalUsuarioProps {
  onDefinirUsuario: (nome: string) => void;
  usuarioAtual?: string;
}

export function ModalUsuario({ onDefinirUsuario, usuarioAtual }: ModalUsuarioProps) {
  const [nome, setNome] = useState(usuarioAtual || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim()) {
      onDefinirUsuario(nome.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header" style={{ justifyContent: 'center' }}>
          <div className="modal-title" style={{ textAlign: 'center' }}>
            <div className="modal-icon" style={{ margin: '0 auto 12px' }}>
              <User size={28} />
            </div>
            <div>
              <h2>{usuarioAtual ? 'Trocar Usuário' : 'Bem-vindo ao SOMMA CRM'}</h2>
              <p>{usuarioAtual ? 'Digite seu nome para continuar' : 'Digite seu nome para começar'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Seu Nome</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: João Silva"
              autoFocus
              required
              style={{ textAlign: 'center', fontSize: '1.125rem' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            <LogIn size={18} />
            {usuarioAtual ? 'Trocar Usuário' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
