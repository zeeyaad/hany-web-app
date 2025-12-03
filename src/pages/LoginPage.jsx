import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/labal.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';
import { Store, Lock, User } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const apiPostJSON = null;

  useEffect(() => {
    if (user && user.role) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
    } else {
      const stored = localStorage.getItem('hanyshop_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.role === 'admin') navigate('/admin');
        else if (parsed?.role === 'staff') navigate('/staff');
      }
    }
  }, [user, navigate]);

  const validate = () => {
    const nextErrors = {};
    const emailPattern = /.+@.+\..+/;
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!emailPattern.test(email.trim())) nextErrors.email = 'Enter a valid email';
    if (!password.trim()) nextErrors.password = 'Password is required';
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        throw new Error(result.message || 'Login failed');
      }
      const profile = result.user;
      toast({ title: 'Login Successful', description: `Welcome back, ${profile.name}` });
      setPassword('');
      if (profile.role === 'admin') navigate('/admin');
      else if (profile.role === 'staff') navigate('/staff');
      else navigate('/');
    } catch (err) {
      setApiError(err.message || 'Login failed');
      toast({ title: 'Login Failed', description: err.message || 'Unable to login', variant: 'destructive' });
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Hany's Shop</title>
        <meta name="description" content="Login to access Hany's Shop admin panel or staff dashboard." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="space-y-4 text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
              >
                <Store className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Hany's Shop
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {apiError && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {apiError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      aria-invalid={Boolean(errors.password)}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-gray-600 font-medium mb-2">Demo Credentials:</p>
                <p className="text-xs text-gray-500">Admin: admin / admin123</p>
                <p className="text-xs text-gray-500">Staff: staff / staff123</p>
              </div>
              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Back to Shop
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;