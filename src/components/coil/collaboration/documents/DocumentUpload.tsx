import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUploadDocument, useDocumentFolders } from "@/hooks/useCoilDocuments";
import { Upload, X, File, FolderIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentUploadProps {
  projectId: string;
  folderId?: string | null;
  onClose: () => void;
}

export function DocumentUpload({ projectId, folderId, onClose }: DocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(folderId || undefined);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadDocument = useUploadDocument();
  const { data: folders = [] } = useDocumentFolders(projectId);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      for (const file of selectedFiles) {
        await uploadDocument.mutateAsync({
          file,
          projectId,
          folderId: selectedFolderId,
          description,
          tags: tags.length > 0 ? tags : undefined
        });
      }
      onClose();
    } catch (error) {
      console.error("Error uploading documents:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getSelectedFolderName = () => {
    if (!selectedFolderId) return "Documentos Raíz";
    const folder = folders.find(f => f.id === selectedFolderId);
    return folder?.name || "Carpeta Desconocida";
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Documentos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Selección de carpeta */}
          <div className="space-y-2">
            <Label>Carpeta de Destino</Label>
            <Select value={selectedFolderId || ""} onValueChange={(value) => setSelectedFolderId(value || undefined)}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4" />
                    {getSelectedFolderName()}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <div className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4" />
                    Documentos Raíz
                  </div>
                </SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4" />
                      {folder.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Área de drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-2">Arrastra archivos aquí o</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Seleccionar Archivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Máximo 10MB por archivo
            </p>
          </div>

          {/* Lista de archivos seleccionados */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <Label>Archivos Seleccionados ({selectedFiles.length})</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type || 'Tipo desconocido'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el contenido de los documentos"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiquetas (opcional)</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Agregar etiqueta"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button onClick={addTag} variant="outline">
                Agregar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploadDocument.isPending}
            >
              {uploadDocument.isPending ? "Subiendo..." : `Subir ${selectedFiles.length} archivo${selectedFiles.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}