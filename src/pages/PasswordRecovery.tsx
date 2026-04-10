import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail, Lock, CheckCircle } from 'lucide-react';

type ResetStep = 'request' | 'verify' | 'success';

export default function PasswordRecovery() {
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { requestReset, validateAndReset } = usePasswordReset();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa tu correo electrónico',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const result = await requestReset(email);
    setLoading(false);

    if (result.success) {
      setStep('verify');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive'
      });
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      toast({
        title: 'Error',
        description: 'El código debe ser 6 dígitos',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 8 caracteres',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const result = await validateAndReset(code, newPassword);
    setLoading(false);

    if (result.success) {
      setStep('success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Link 
              to="/login"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a login
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Request Reset Step */}
          {step === 'request' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Mail className="h-12 w-12 text-blue-500" />
                </div>
                <CardTitle>Recupera tu Contraseña</CardTitle>
                <CardDescription>
                  Ingresa tu correo electrónico y te enviaremos un código de verificación
                </CardDescription>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-10"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Código'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Verify Code and Reset Password Step */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Lock className="h-12 w-12 text-blue-500" />
                </div>
                <CardTitle>Ingresa tu Nuevo Acceso</CardTitle>
                <CardDescription>
                  Se ha enviado un código a <span className="font-semibold text-gray-700">{email}</span>
                </CardDescription>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificación (6 dígitos)</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    className="h-10 text-center text-lg tracking-widest font-monospace"
                  />
                  <p className="text-xs text-gray-500">Válido por 30 minutos</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="h-10"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Actualizar Contraseña'
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t">
                <button
                  onClick={() => setStep('request')}
                  className="text-sm text-blue-600 hover:text-blue-700 w-full text-center"
                  disabled={loading}
                >
                  ¿No recibiste el código? Intenta de nuevo
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-green-600">¡Éxito!</CardTitle>
                <CardDescription>
                  Tu contraseña ha sido actualizada correctamente
                </CardDescription>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Serás redirigido a la página de login en unos momentos...
                </p>
                <Link to="/login">
                  <Button className="w-full h-10">
                    Ir a Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
