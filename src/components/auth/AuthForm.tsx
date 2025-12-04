import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Film, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for the confirmation link!');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4 animate-fade-in">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--accent))] rounded-full blur-[128px] opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(var(--accent))] rounded-full blur-[128px] opacity-20"></div>
      </div>

      <Card className="w-full max-w-md card-base border border-[hsl(var(--border))] animate-scale-in">
        <CardHeader className="space-y-6 text-center pb-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="bg-[hsl(var(--accent))] p-4 rounded-2xl transition-all duration-300 hover:scale-110">
              <Film className="w-8 h-8 text-[hsl(var(--text-primary))]" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-3xl font-bold text-[hsl(var(--text-primary))] mb-2">
              WatchTracker
            </CardTitle>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[hsl(var(--text-secondary))] flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-base text-[hsl(var(--text-primary))] h-12"
              />
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[hsl(var(--text-secondary))] flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-base text-[hsl(var(--text-primary))] h-12"
              />
              {!isLogin && (
                <p className="text-xs text-[hsl(var(--text-muted))]">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-[hsl(var(--error-muted))] border border-[hsl(var(--error))] animate-slide-down">
                <p className="text-sm text-[hsl(var(--error))]">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="p-4 rounded-xl bg-[hsl(var(--success-muted))] border border-[hsl(var(--success))] animate-slide-down">
                <p className="text-sm text-[hsl(var(--success))]">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-base h-12 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-[hsl(var(--text-primary))] font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Toggle Auth Mode */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setMessage(null);
                }}
                className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
              >
                {isLogin ? (
                  <>
                    Don't have an account? <span className="font-medium">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account? <span className="font-medium">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--border))]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[hsl(var(--surface))] px-4 text-[hsl(var(--text-muted))]">
                Secure authentication
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-center text-[hsl(var(--text-muted))]">
            By continuing, you agree to track your movies and shows privately
          </p>
        </CardContent>
      </Card>
    </div>
  );
};