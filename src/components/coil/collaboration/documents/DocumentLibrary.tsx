import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProjectDocuments, useDocumentFolders, useUploadDocument } from "@/hooks/useCoilDocuments";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FolderTree } from "./FolderTree";
import { DocumentViewer } from "./DocumentViewer";
import { DocumentUpload } from "./DocumentUpload";
import { 
  Folder, 
  File, 
  Upload, 
  Search, 
  Grid, 
  List, 
  Download,
  Eye,
  MoreVertical,
  Share2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface DocumentLibraryProps {
  projectId: string;
}

export default function DocumentLibrary({ projectId }: DocumentLibraryProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const { data: folders = [] } = useDocumentFolders(projectId);
  const { data: documents = [] } = useProjectDocuments(projectId, selectedFolderId);

  const filteredDocuments = documents.filter(doc =>
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getCurrentFolderName = () => {
    if (!selectedFolderId) return "Documentos Raíz";
    const folder = folders.find(f => f.id === selectedFolderId);
    return folder?.name || "Carpeta Desconocida";
  };

  const renderDocumentGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredDocuments.map((doc) => (
        <Card key={doc.id} className="group hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">{getFileIcon(doc.file_name)}</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedDocument(doc.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(doc.file_url, '_blank')}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm line-clamp-2">{doc.file_name}</h4>
              
              {doc.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {doc.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(doc.file_size)}</span>
                <span>v{doc.version_number}</span>
              </div>
              
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {doc.tags.slice(0, 2).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {doc.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{doc.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(doc.uploaded_at), { 
                  addSuffix: true,
                  locale: es 
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDocumentList = () => (
    <div className="space-y-2">
      {filteredDocuments.map((doc) => (
        <Card key={doc.id} className="hover:bg-accent/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg">{getFileIcon(doc.file_name)}</span>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{doc.file_name}</h4>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {doc.description}
                    </p>
                  )}
                </div>
                
                <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>v{doc.version_number}</span>
                  <span>
                    {formatDistanceToNow(new Date(doc.uploaded_at), { 
                      addSuffix: true,
                      locale: es 
                    })}
                  </span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedDocument(doc.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(doc.file_url, '_blank')}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Sidebar con árbol de carpetas */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-2">Estructura de Carpetas</h3>
          <Button 
            onClick={() => setShowUpload(true)}
            size="sm" 
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir Documento
          </Button>
        </div>
        
        <div className="p-4">
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={setSelectedFolderId}
            projectId={projectId}
          />
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{getCurrentFolderName()}</h2>
              <p className="text-sm text-muted-foreground">
                {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-4 overflow-auto">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <File className="h-12 w-12 mb-4" />
              <p className="text-lg mb-2">No hay documentos</p>
              <p className="text-sm">
                {searchTerm ? 'No se encontraron documentos con ese criterio' : 'Sube el primer documento a esta carpeta'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' && renderDocumentGrid()}
              {viewMode === 'list' && renderDocumentList()}
            </>
          )}
        </div>
      </div>

      {/* Modales */}
      {showUpload && (
        <DocumentUpload
          projectId={projectId}
          folderId={selectedFolderId}
          onClose={() => setShowUpload(false)}
        />
      )}
      
      {selectedDocument && (
        <DocumentViewer
          documentId={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}