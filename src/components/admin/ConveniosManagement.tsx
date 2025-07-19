
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Eye, FileText, Download, CheckCircle, XCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConvenioUniversidad {
  id: string;
  nombre_universidad: string;
  razon_social: string;
  nit_rut: string;
  direccion: string;
  telefono: string;
  correo_institucional: string;
  sitio_web?: string;
  responsable_nombre: string;
  responsable_cargo: string;
  responsable_identificacion: string;
  responsable_correo: string;
  responsable_telefono: string;
  contrato_firmado_url?: string;
  carta_adhesion_url?: string;
  estado: string;
  motivo_rechazo?: string;
  observaciones?: string;
  acepta_terminos: boolean;
  fecha_solicitud: string;
  fecha_revision?: string;
  fecha_aprobacion?: string;
  created_at: string;
  updated_at: string;
}

const estadoColors = {
  'pendiente_revision': 'bg-yellow-100 text-yellow-800',
  'aprobado': 'bg-green-100 text-green-800',
  'rechazado': 'bg-red-100 text-red-800',
  'pendiente_documentos': 'bg-blue-100 text-blue-800'
};

const estadoIcons = {
  'pendiente_revision': Clock,
  'aprobado': CheckCircle,
  'rechazado': XCircle,
  'pendiente_documentos': AlertCircle
};

const ConveniosManagement = () => {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [convenioSeleccionado, setConvenioSeleccionado] = useState<ConvenioUniversidad | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [dialogoAccion, setDialogoAccion] = useState(false);
  const [accionTipo, setAccionTipo] = useState<'aprobar' | 'rechazar' | 'solicitar_info'>('aprobar');
  const [observaciones, setObservaciones] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const queryClient = useQueryClient();

  const { data: convenios, isLoading } = useQuery({
    queryKey: ['convenios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('convenios_universidades')
        .select('*')
        .order('fecha_solicitud', { ascending: false });
      
      if (error) throw error;
      return data as ConvenioUniversidad[];
    }
  });

  const mutationEstado = useMutation({
    mutationFn: async ({ 
      id, 
      nuevoEstado, 
      observaciones, 
      motivoRechazo 
    }: { 
      id: string; 
      nuevoEstado: string; 
      observaciones?: string; 
      motivoRechazo?: string; 
    }) => {
      const updateData: any = {
        estado: nuevoEstado,
        fecha_revision: new Date().toISOString(),
        observaciones
      };

      if (nuevoEstado === 'aprobado') {
        updateData.fecha_aprobacion = new Date().toISOString();
      }

      if (nuevoEstado === 'rechazado' && motivoRechazo) {
        updateData.motivo_rechazo = motivoRechazo;
      }

      const { error } = await supabase
        .from('convenios_universidades')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Registrar en historial
      await supabase
        .from('convenios_historial')
        .insert({
          convenio_id: id,
          estado_anterior: convenioSeleccionado?.estado,
          estado_nuevo: nuevoEstado,
          observaciones
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      toast({
        title: "Estado actualizado",
        description: "El estado del convenio ha sido actualizado correctamente.",
      });
      setDialogoAccion(false);
      setObservaciones('');
      setMotivoRechazo('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del convenio.",
        variant: "destructive",
      });
      console.error('Error updating convenio:', error);
    }
  });

  const conveniosFiltrados = convenios?.filter(convenio => 
    filtroEstado === 'todos' || convenio.estado === filtroEstado
  ) || [];

  const handleAccion = () => {
    if (!convenioSeleccionado) return;

    let nuevoEstado = '';
    switch (accionTipo) {
      case 'aprobar':
        nuevoEstado = 'aprobado';
        break;
      case 'rechazar':
        nuevoEstado = 'rechazado';
        break;
      case 'solicitar_info':
        nuevoEstado = 'pendiente_documentos';
        break;
    }

    mutationEstado.mutate({
      id: convenioSeleccionado.id,
      nuevoEstado,
      observaciones,
      motivoRechazo: accionTipo === 'rechazar' ? motivoRechazo : undefined
    });
  };

  const getEstadoLabel = (estado: string) => {
    const labels = {
      'pendiente_revision': 'Pendiente de Revisión',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado',
      'pendiente_documentos': 'Pendiente de Documentos'
    };
    return labels[estado as keyof typeof labels] || estado;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full border-b-2 border-primary h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Módulo de Convenios "Muévete"</h2>
          <p className="text-muted-foreground">Gestor de Contratos Universitarios</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convenios?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {convenios?.filter(c => c.estado === 'pendiente_revision').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {convenios?.filter(c => c.estado === 'aprobado').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {convenios?.filter(c => c.estado === 'rechazado').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente_revision">Pendiente de Revisión</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
                <SelectItem value="pendiente_documentos">Pendiente de Documentos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Convenios</CardTitle>
          <CardDescription>
            Gestiona las solicitudes de adhesión al programa de movilidad académica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Universidad</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conveniosFiltrados.map((convenio) => {
                const EstadoIcon = estadoIcons[convenio.estado as keyof typeof estadoIcons];
                return (
                  <TableRow key={convenio.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{convenio.nombre_universidad}</div>
                        <div className="text-sm text-muted-foreground">{convenio.nit_rut}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{convenio.responsable_nombre}</div>
                        <div className="text-sm text-muted-foreground">{convenio.responsable_cargo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={estadoColors[convenio.estado as keyof typeof estadoColors]}>
                        <EstadoIcon className="h-3 w-3 mr-1" />
                        {getEstadoLabel(convenio.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(convenio.fecha_solicitud), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {convenio.contrato_firmado_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(convenio.contrato_firmado_url, '_blank')}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                        {convenio.carta_adhesion_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(convenio.carta_adhesion_url, '_blank')}
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConvenioSeleccionado(convenio);
                            setDialogoAbierto(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {convenio.estado === 'pendiente_revision' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setConvenioSeleccionado(convenio);
                                setAccionTipo('aprobar');
                                setDialogoAccion(true);
                              }}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setConvenioSeleccionado(convenio);
                                setAccionTipo('rechazar');
                                setDialogoAccion(true);
                              }}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para ver detalles */}
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Convenio</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de convenio
            </DialogDescription>
          </DialogHeader>
          
          {convenioSeleccionado && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Datos de la Universidad</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nombre:</strong> {convenioSeleccionado.nombre_universidad}</p>
                    <p><strong>Razón Social:</strong> {convenioSeleccionado.razon_social}</p>
                    <p><strong>NIT/RUT:</strong> {convenioSeleccionado.nit_rut}</p>
                    <p><strong>Dirección:</strong> {convenioSeleccionado.direccion}</p>
                    <p><strong>Teléfono:</strong> {convenioSeleccionado.telefono}</p>
                    <p><strong>Email:</strong> {convenioSeleccionado.correo_institucional}</p>
                    {convenioSeleccionado.sitio_web && (
                      <p><strong>Sitio Web:</strong> {convenioSeleccionado.sitio_web}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Datos del Responsable</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nombre:</strong> {convenioSeleccionado.responsable_nombre}</p>
                    <p><strong>Cargo:</strong> {convenioSeleccionado.responsable_cargo}</p>
                    <p><strong>Identificación:</strong> {convenioSeleccionado.responsable_identificacion}</p>
                    <p><strong>Email:</strong> {convenioSeleccionado.responsable_correo}</p>
                    <p><strong>Teléfono:</strong> {convenioSeleccionado.responsable_telefono}</p>
                  </div>
                </div>
              </div>
              
              {convenioSeleccionado.observaciones && (
                <div>
                  <h3 className="font-semibold mb-2">Observaciones</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded">{convenioSeleccionado.observaciones}</p>
                </div>
              )}
              
              {convenioSeleccionado.motivo_rechazo && (
                <div>
                  <h3 className="font-semibold mb-2">Motivo de Rechazo</h3>
                  <p className="text-sm bg-red-50 p-3 rounded text-red-800">{convenioSeleccionado.motivo_rechazo}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para acciones */}
      <Dialog open={dialogoAccion} onOpenChange={setDialogoAccion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accionTipo === 'aprobar' && 'Aprobar Convenio'}
              {accionTipo === 'rechazar' && 'Rechazar Convenio'}
              {accionTipo === 'solicitar_info' && 'Solicitar Más Información'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {accionTipo === 'rechazar' && (
              <div>
                <label className="text-sm font-medium">Motivo del rechazo *</label>
                <Textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Explique el motivo del rechazo..."
                  required
                />
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">Observaciones</label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones adicionales..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogoAccion(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAccion}
                disabled={accionTipo === 'rechazar' && !motivoRechazo.trim()}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConveniosManagement;
