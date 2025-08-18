import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Download, 
  Eye, 
  Share2, 
  History,
  FileText,
  Image,
  Video,
  FileIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface DocumentViewerProps {
  documentId: string;
  onClose: () => void;
}

export function DocumentViewer({ documentId, onClose }: DocumentViewerProps) {
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  // Cargar documento por ID
  const { data: document, isLoading } = useQuery({
    queryKey: ['coil-document', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coil_project_documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!documentId
  });
  const parseStorageFromUrl = (url: string): { bucket: string; path: string } | null => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      const idx = parts.indexOf('object');
      if (idx !== -1) {
        const bucket = parts[idx + 2];
        const path = parts.slice(idx + 3).join('/');
        if (bucket && path) return { bucket, path };
      }
      return null;
    } catch {
      return null;
    }
  };

  const { data: signedData } = useQuery({
    queryKey: ['coil-document-signed-url', document?.id, document?.file_url],
    queryFn: async () => {
      if (!document?.file_url) return null;
      const info = parseStorageFromUrl(document.file_url);
      if (!info) return { signedUrl: document.file_url };
      const { data } = await supabase.storage
        .from(info.bucket)
        .createSignedUrl(info.path, 60 * 60);
      return { signedUrl: data?.signedUrl || document.file_url };
    },
    enabled: !!document?.file_url
  });

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargando documento...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!document) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Documento no encontrado</DialogTitle>
          </DialogHeader>
          <p>No se pudo cargar el documento solicitado.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-6 w-6 text-green-600" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-6 w-6 text-purple-600" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const canPreview = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'].includes(ext || '');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getFileIcon(document.file_name)}
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{document.file_name}</div>
              <div className="text-sm text-muted-foreground">
                Versión {document.version_number} • {formatFileSize(document.file_size)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Vista previa del documento */}
            <div className="lg:col-span-2 space-y-4">
              {canPreview(document.file_name) ? (
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Vista Previa</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(signedData?.signedUrl || document.file_url, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Original
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(signedData?.signedUrl || document.file_url, '_blank')}>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-96 overflow-auto">
                    {document.file_name.toLowerCase().endsWith('.pdf') && (
                      <iframe
                        src={signedData?.signedUrl || document.file_url}
                        className="w-full h-full"
                        title="Vista previa PDF"
                      />
                    )}
                    
                    {['jpg', 'jpeg', 'png', 'gif'].some(ext => 
                      document.file_name.toLowerCase().endsWith(ext)
                    ) && (
                      <img
                        src={signedData?.signedUrl || document.file_url}
                        alt={document.file_name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center bg-gray-50">
                  {getFileIcon(document.file_name)}
                  <div className="mt-4">
                    <p className="font-medium mb-2">Vista previa no disponible</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Este tipo de archivo no se puede previsualizar
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => window.open(signedData?.signedUrl || document.file_url, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Abrir
                      </Button>
                      <Button onClick={() => window.open(signedData?.signedUrl || document.file_url, '_blank')}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel de información */}
            <div className="space-y-4">
              {/* Información básica */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Información del Documento</h3>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subido por:</span>
                    <div className="font-medium">
                      {document.uploaded_by_profile?.full_name || 'Usuario desconocido'}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Fecha:</span>
                    <div>
                      {formatDistanceToNow(new Date(document.uploaded_at), { 
                        addSuffix: true,
                        locale: es 
                      })}
                    </div>
                  </div>
                  
                    {document.folder && (
                      <div>
                        <span className="text-muted-foreground">Carpeta:</span>
                        <div className="font-medium">{document.folder?.name || '-'}</div>
                      </div>
                    )}
                  
                  <div>
                    <span className="text-muted-foreground">Tamaño:</span>
                    <div>{formatFileSize(document.file_size)}</div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <div>{document.document_type || 'Desconocido'}</div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {document.description && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-sm text-muted-foreground">
                    {document.description}
                  </p>
                </div>
              )}

              {/* Etiquetas */}
              {document.tags && document.tags.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold mb-2">Acciones</h3>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Historial de Versiones
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>

              {/* Historial de versiones */}
              {showVersionHistory && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Historial de Versiones</h3>
                  <div className="space-y-2">
                    <div className="p-2 border rounded text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">v{document.version_number} (actual)</span>
                        <Badge variant="default">Actual</Badge>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(document.uploaded_at), { 
                          addSuffix: true,
                          locale: es 
                        })}
                      </div>
                    </div>
                    
                    {document.previous_version_id && (
                      <div className="p-2 border rounded text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">v{document.version_number - 1}</span>
                          <Button variant="ghost" size="sm">Ver</Button>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Versión anterior
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}