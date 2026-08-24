import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { loginUser } from '@/api/auth';
import { setAccessToken, setRefreshToken } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { PasswordStrength } from './PasswordStrength';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(username, password);
      setAccessToken(user.token);
      setRefreshToken(user.refreshToken);
      login(user, rememberMe);
      toast.success('Login successful');
      navigate('/board');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Username"
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="username"
      />
      <div>
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <PasswordStrength password={password} />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400">
          Remember me for 30 days
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <Button type="submit" loading={loading} className="w-full">
        Sign In
      </Button>
      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        Demo: emilys / emilyspass
      </p>
    </form>
  );
}
