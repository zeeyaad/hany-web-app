import React, { useState, useEffect } from 'react';
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('hanyshop_users') || '[]');
    if (users.length === 0) {
      const defaultUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'staff', password: 'staff123', role: 'staff' }
      ];
      localStorage.setItem('hanyshop_users', JSON.stringify(defaultUsers));
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      }
    }
  }, [user, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(username, password);
    
    if (result.success) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
      });
      
      if (result.role === 'admin') {
        navigate('/admin');
      } else if (result.role === 'staff') {
        navigate('/staff');
      }
    } else {
      toast({
        title: "Login Failed",
        description: result.message,
        variant: "destructive",
      });
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
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      required
                    />
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
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign In
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