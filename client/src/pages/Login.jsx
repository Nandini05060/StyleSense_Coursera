import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(redirectPath);
    } else {
      setError(result.message || 'Invalid credentials.');
    }
  };

  const autofillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="editorial-subheading">Welcome Back</span>
        <h1 className="editorial-heading text-3xl">Sign In to StyleSense</h1>
        <p className="text-xs text-taupe font-sans">
          Access your saved preferences, wishlist, and order history.
        </p>
      </div>

      {/* Demo Credentials Quick Fill Buttons */}
      <div className="p-4 bg-white border border-taupe-light shadow-subtle space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-sans uppercase font-bold text-burgundy tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>One-Click Academic Demo Logins</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => autofillDemo('admin@stylesense.ai', 'Admin@123')}
            className="py-1.5 px-2 bg-charcoal text-white text-[10px] font-sans font-semibold uppercase tracking-wider hover:bg-burgundy transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => autofillDemo('student@stylesense.ai', 'Student@123')}
            className="py-1.5 px-2 bg-ivory text-charcoal border border-taupe-border text-[10px] font-sans font-semibold uppercase tracking-wider hover:bg-taupe-light transition-colors"
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => autofillDemo('professional@stylesense.ai', 'Professional@123')}
            className="py-1.5 px-2 bg-ivory text-charcoal border border-taupe-border text-[10px] font-sans font-semibold uppercase tracking-wider hover:bg-taupe-light transition-colors"
          >
            Pro
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-taupe-light p-6 sm:p-8 space-y-5 shadow-editorial">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
            {error}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-charcoal/80">
            Password <span className="text-burgundy">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="editorial-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-taupe hover:text-charcoal"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="burgundy"
          size="lg"
          loading={loading}
          className="w-full mt-2"
        >
          Sign In
        </Button>

        <div className="text-center pt-2">
          <p className="text-xs text-taupe font-sans">
            New to StyleSense AI?{' '}
            <Link to={`/register?redirect=${encodeURIComponent(redirectPath)}`} className="text-burgundy font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
