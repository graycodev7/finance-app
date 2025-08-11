"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
  showRegister: boolean;
}

export function LoginForm({ onToggleMode, showRegister }: LoginFormProps) {
  const { login, register, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (showRegister) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      
      // Show toast notification for better user feedback
      if (errorMessage.includes('Email o contraseña incorrectos') || 
          errorMessage.includes('Usuario no encontrado')) {
        toast({
          title: "Error de autenticación",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-center text-gray-900">
            {showRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </CardTitle>
          <CardDescription className="text-center text-sm text-gray-700">
            {showRegister 
              ? 'Crea tu cuenta para comenzar a gestionar tus finanzas'
              : 'Ingresa a tu cuenta para continuar'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-3">
            {showRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-800 font-medium">Nombre completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="text-gray-900 placeholder:text-gray-500 bg-white border-gray-300"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-800 font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="text-gray-900 placeholder:text-gray-500 bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-800 font-medium">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={showRegister ? "new-password" : "current-password"}
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                minLength={6}
                className="text-gray-900 placeholder:text-gray-500 bg-white border-gray-300"
              />
              {showRegister && (
                <p className="text-xs text-gray-600">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              variant="login"
              className="w-full bg-black hover:bg-gray-800 text-white font-medium" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {showRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-sm text-gray-600 hover:text-blue-600 underline font-medium"
              disabled={isLoading}
            >
              {showRegister 
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'
              }
            </button>
          </div>


        </CardContent>
      </Card>
    </div>
  );
}
