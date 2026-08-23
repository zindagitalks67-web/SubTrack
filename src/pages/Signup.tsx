import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Wallet } from 'lucide-react';

export default function Signup({ onToggle }: { onToggle: () => void }) {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signUp(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Wallet className="w-12 h-12 mx-auto text-brand-purple mb-2" />
          <h1 className="text-2xl font-bold">{t('app_title')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-content-secondary mb-1.5 block">{t('name')}</label>
            <input
              required
              className="glass-input w-full px-3.5 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-content-secondary mb-1.5 block">{t('email')}</label>
            <input
              type="email"
              required
              className="glass-input w-full px-3.5 py-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-content-secondary mb-1.5 block">{t('password')}</label>
            <input
              type="password"
              required
              className="glass-input w-full px-3.5 py-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3">{t('signup')}</button>
        </form>
        <p className="text-center text-sm mt-4 text-content-secondary">
          {t('login')}? <button onClick={onToggle} className="text-brand-purple font-medium">{t('login')}</button>
        </p>
      </div>
    </div>
  );
}