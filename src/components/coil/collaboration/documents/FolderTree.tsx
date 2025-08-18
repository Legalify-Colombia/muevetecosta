import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentFolders, useCreateDocumentFolder } from "@/hooks/useCoilDocuments";
import { 
  Folder, 
  FolderPlus, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DocumentFolder } from "@/hooks/useCoilDocuments";

interface FolderTreeProps {
  folders: DocumentFolder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  projectId: string;
}

export function FolderTree({ 
  folders, 
  selectedFolderId, 
  onFolderSelect, 
  projectId 
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [newFolderData, setNewFolderData] = useState({
    name: "",
    description: ""
  });

  const createFolder = useCreateDocumentFolder();

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getRootFolders = () => folders.filter(f => !f.parent_folder_id);
  const getSubfolders = (parentId: string) => folders.filter(f => f.parent_folder_id === parentId);

  const handleCreateFolder = async () => {
    if (!newFolderData.name.trim()) return;

    await createFolder.mutateAsync({
      project_id: projectId,
      parent_folder_id: parentFolderId,
      name: newFolderData.name,
      description: newFolderData.description,
      access_permissions: { all: true }
    });

    setNewFolderData({ name: "", description: "" });
    setShowCreateDialog(false);
    setParentFolderId(null);
  };

  const openCreateDialog = (parentId: string | null = null) => {
    setParentFolderId(parentId);
    setShowCreateDialog(true);
  };

  const renderFolder = (folder: DocumentFolder, level: number = 0) => {
    const hasSubfolders = getSubfolders(folder.id).length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div className={`flex items-center gap-1 py-1 px-2 rounded hover:bg-accent cursor-pointer group ${
          isSelected ? 'bg-accent' : ''
        }`}>
          <div 
            className="flex items-center gap-1 flex-1"
            style={{ paddingLeft: `${level * 16}px` }}
          >
            {hasSubfolders ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-4 h-4 p-0"
                onClick={() => toggleFolder(folder.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : (
              <div className="w-4" />
            )}
            
            <div 
              className="flex items-center gap-2 flex-1"
              onClick={() => onFolderSelect(folder.id)}
            >
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 text-blue-600" />
              )}
              <span className="text-sm truncate">{folder.name}</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100"
            onClick={() => openCreateDialog(folder.id)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        {hasSubfolders && isExpanded && (
          <div>
            {getSubfolders(folder.id).map(subfolder => 
              renderFolder(subfolder, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* Carpeta raíz */}
      <div className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-accent cursor-pointer ${
        selectedFolderId === null ? 'bg-accent' : ''
      }`}>
        <div 
          className="flex items-center gap-2 flex-1"
          onClick={() => onFolderSelect(null)}
        >
          <Folder className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Documentos Raíz</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-4 h-4 p-0"
          onClick={() => openCreateDialog(null)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Carpetas */}
      {getRootFolders().map(folder => renderFolder(folder))}

      {/* Botón para crear carpeta */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => openCreateDialog(null)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Nueva Carpeta
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Carpeta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Nombre de la Carpeta</Label>
              <Input
                id="folder-name"
                value={newFolderData.name}
                onChange={(e) => setNewFolderData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la carpeta"
              />
            </div>
            
            <div>
              <Label htmlFor="folder-description">Descripción (opcional)</Label>
              <Textarea
                id="folder-description"
                value={newFolderData.description}
                onChange={(e) => setNewFolderData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la carpeta"
                rows={3}
              />
            </div>
            
            {parentFolderId && (
              <div className="text-sm text-muted-foreground">
                <strong>Carpeta padre:</strong> {folders.find(f => f.id === parentFolderId)?.name}
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateFolder}
                disabled={!newFolderData.name.trim() || createFolder.isPending}
              >
                {createFolder.isPending ? "Creando..." : "Crear Carpeta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}