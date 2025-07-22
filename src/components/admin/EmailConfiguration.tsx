
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Settings, FileText, History } from 'lucide-react';
import { EmailTemplateManager } from './EmailTemplateManager';
import { EmailHistory } from './EmailHistory';
import { EmailTestModule } from './EmailTestModule';

interface EmailConfig {
  id: string;
  resend_api_key: string | null;
  default_sender_email: string;
  default_sender_name: string;
  is_active: boolean;
}

export const EmailConfiguration = () => {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    resend_api_key: '',
    default_sender_email: '',
    default_sender_name: '',
    is_active: true,
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('email_configuration')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading email configuration:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setConfig(data);
        setFormData({
          resend_api_key: data.resend_api_key || '',
          default_sender_email: data.default_sender_email,
          default_sender_name: data.default_sender_name,
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        resend_api_key: formData.resend_api_key || null,
        default_sender_email: formData.default_sender_email,
        default_sender_name: formData.default_sender_name,
        is_active: formData.is_active,
      };

      if (config) {
        // Update existing configuration
        const { error } = await supabase
          .from('email_configuration')
          .update(updateData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create new configuration
        const { error } = await supabase
          .from('email_configuration')
          .insert([updateData]);

        if (error) throw error;
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración de correo se ha guardado exitosamente",
      });

      await loadConfiguration();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configuración de Correo Electrónico</h1>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Pruebas
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Resend</CardTitle>
              <CardDescription>
                Configura la API de Resend para el envío de correos electrónicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key de Resend</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                    value={formData.resend_api_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, resend_api_key: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Obtén tu API Key desde {' '}
                    <a 
                      href="https://resend.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      https://resend.com/api-keys
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender-email">Correo del Remitente</Label>
                  <Input
                    id="sender-email"
                    type="email"
                    value={formData.default_sender_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_sender_email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender-name">Nombre del Remitente</Label>
                  <Input
                    id="sender-name"
                    value={formData.default_sender_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_sender_name: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is-active">Configuración activa</Label>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="templates">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="test">
            <EmailTestModule />
          </TabsContent>

          <TabsContent value="history">
            <EmailHistory />
          </TabsContent>
      </Tabs>
    </div>
  );
};
