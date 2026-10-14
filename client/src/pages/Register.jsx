import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate(redirectPath);
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="editorial-subheading">Join The Editorial</span>
        <h1 className="editorial-heading text-3xl">Create an Account</h1>
        <p className="text-xs text-taupe font-sans">
          Unlock personalized rule-based AI recommendations, outfit building, and saved preferences.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-taupe-light p-6 sm:p-8 space-y-5 shadow-editorial">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          required
          placeholder="e.g. Priya Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
              placeholder="Minimum 6 characters"
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
          Create Member Account
        </Button>

        <div className="text-center pt-2">
          <p className="text-xs text-taupe font-sans">
            Already have an account?{' '}
            <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="text-burgundy font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
