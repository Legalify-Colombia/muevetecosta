import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Folder, FolderPlus } from "lucide-react";

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parent_folder_id?: string;
  access_permissions: {
    all: boolean;
    coordinator: boolean;
    collaborator: boolean;
    student: boolean;
  };
}

export interface ProjectDocumentStructure {
  folders: DocumentFolder[];
}

interface ProjectDocumentStructureProps {
  data: ProjectDocumentStructure;
  onChange: (data: ProjectDocumentStructure) => void;
}

const DEFAULT_FOLDERS: DocumentFolder[] = [
  {
    id: "general",
    name: "Documentos Generales",
    description: "Documentos accesibles para todos los participantes",
    access_permissions: {
      all: true,
      coordinator: true,
      collaborator: true,
      student: true
    }
  },
  {
    id: "assignments",
    name: "Tareas y Asignaciones",
    description: "Archivos relacionados con tareas del proyecto",
    access_permissions: {
      all: true,
      coordinator: true,
      collaborator: true,
      student: true
    }
  },
  {
    id: "coordination",
    name: "Coordinación",
    description: "Documentos exclusivos para coordinadores y colaboradores",
    access_permissions: {
      all: false,
      coordinator: true,
      collaborator: true,
      student: false
    }
  },
  {
    id: "resources",
    name: "Recursos de Aprendizaje",
    description: "Materiales de estudio y referencias",
    access_permissions: {
      all: true,
      coordinator: true,
      collaborator: true,
      student: true
    }
  }
];

export default function ProjectDocumentStructure({ data, onChange }: ProjectDocumentStructureProps) {
  const [newFolder, setNewFolder] = useState<Partial<DocumentFolder>>({
    name: "",
    description: "",
    parent_folder_id: undefined,
    access_permissions: {
      all: true,
      coordinator: true,
      collaborator: true,
      student: true
    }
  });

  // Inicializar con carpetas por defecto si no hay carpetas
  if (data.folders.length === 0) {
    onChange({ folders: DEFAULT_FOLDERS });
  }

  const addFolder = () => {
    if (!newFolder.name) return;
    
    const folder: DocumentFolder = {
      id: crypto.randomUUID(),
      name: newFolder.name,
      description: newFolder.description,
      parent_folder_id: newFolder.parent_folder_id,
      access_permissions: newFolder.access_permissions!
    };

    onChange({
      folders: [...data.folders, folder]
    });

    setNewFolder({
      name: "",
      description: "",
      parent_folder_id: undefined,
      access_permissions: {
        all: true,
        coordinator: true,
        collaborator: true,
        student: true
      }
    });
  };

  const removeFolder = (id: string) => {
    // No permitir eliminar carpetas que tienen subcarpetas
    const hasSubfolders = data.folders.some(folder => folder.parent_folder_id === id);
    if (hasSubfolders) {
      alert("No se puede eliminar una carpeta que contiene subcarpetas");
      return;
    }

    onChange({
      folders: data.folders.filter(folder => folder.id !== id)
    });
  };

  const updateFolderPermission = (folderId: string, role: keyof DocumentFolder['access_permissions'], value: boolean) => {
    onChange({
      folders: data.folders.map(folder => 
        folder.id === folderId 
          ? { 
              ...folder, 
              access_permissions: { 
                ...folder.access_permissions, 
                [role]: value,
                ...(role === 'all' && value ? {
                  coordinator: true,
                  collaborator: true,
                  student: true
                } : {})
              }
            }
          : folder
      )
    });
  };

  const getRootFolders = () => data.folders.filter(folder => !folder.parent_folder_id);
  const getSubfolders = (parentId: string) => data.folders.filter(folder => folder.parent_folder_id === parentId);

  const renderFolder = (folder: DocumentFolder, level: number = 0) => (
    <div key={folder.id} className={`border rounded-lg ${level > 0 ? 'ml-6 mt-2' : ''}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-blue-600" />
            <h5 className="font-medium">{folder.name}</h5>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFolder(folder.id)}
            disabled={getSubfolders(folder.id).length > 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {folder.description && (
          <p className="text-sm text-muted-foreground">{folder.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Todos</span>
            <input
              type="checkbox"
              checked={folder.access_permissions.all}
              onChange={(e) => updateFolderPermission(folder.id, 'all', e.target.checked)}
              className="rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Coordinador</span>
            <input
              type="checkbox"
              checked={folder.access_permissions.coordinator}
              onChange={(e) => updateFolderPermission(folder.id, 'coordinator', e.target.checked)}
              className="rounded"
              disabled={folder.access_permissions.all}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Colaborador</span>
            <input
              type="checkbox"
              checked={folder.access_permissions.collaborator}
              onChange={(e) => updateFolderPermission(folder.id, 'collaborator', e.target.checked)}
              className="rounded"
              disabled={folder.access_permissions.all}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Estudiante</span>
            <input
              type="checkbox"
              checked={folder.access_permissions.student}
              onChange={(e) => updateFolderPermission(folder.id, 'student', e.target.checked)}
              className="rounded"
              disabled={folder.access_permissions.all}
            />
          </div>
        </div>
      </div>
      
      {/* Renderizar subcarpetas */}
      {getSubfolders(folder.id).map(subfolder => renderFolder(subfolder, level + 1))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estructura de Documentos</CardTitle>
        <CardDescription>
          Configure la organización inicial de carpetas para el repositorio de documentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Estructura de carpetas existente */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            Estructura de Carpetas
          </h4>
          
          <div className="space-y-2">
            {getRootFolders().map(folder => renderFolder(folder))}
          </div>
        </div>

        {/* Formulario para agregar nueva carpeta */}
        <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
          <h5 className="font-medium">Agregar Nueva Carpeta</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="folder_name">Nombre de la Carpeta</Label>
              <Input
                id="folder_name"
                value={newFolder.name || ""}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                placeholder="Nombre de la carpeta"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Carpeta Padre</Label>
              <Select 
                value={newFolder.parent_folder_id || "root"} 
                onValueChange={(value) => setNewFolder({ ...newFolder, parent_folder_id: value === "root" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Carpeta raíz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Carpeta raíz</SelectItem>
                  {data.folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder_description">Descripción</Label>
            <Textarea
              id="folder_description"
              value={newFolder.description || ""}
              onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
              placeholder="Descripción de la carpeta y su propósito"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Permisos de Acceso</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Todos</span>
                <input
                  type="checkbox"
                  checked={newFolder.access_permissions?.all || false}
                  onChange={(e) => setNewFolder({
                    ...newFolder,
                    access_permissions: {
                      all: e.target.checked,
                      coordinator: e.target.checked,
                      collaborator: e.target.checked,
                      student: e.target.checked
                    }
                  })}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Coordinador</span>
                <input
                  type="checkbox"
                  checked={newFolder.access_permissions?.coordinator || false}
                  onChange={(e) => setNewFolder({
                    ...newFolder,
                    access_permissions: {
                      ...newFolder.access_permissions!,
                      coordinator: e.target.checked
                    }
                  })}
                  className="rounded"
                  disabled={newFolder.access_permissions?.all}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Colaborador</span>
                <input
                  type="checkbox"
                  checked={newFolder.access_permissions?.collaborator || false}
                  onChange={(e) => setNewFolder({
                    ...newFolder,
                    access_permissions: {
                      ...newFolder.access_permissions!,
                      collaborator: e.target.checked
                    }
                  })}
                  className="rounded"
                  disabled={newFolder.access_permissions?.all}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Estudiante</span>
                <input
                  type="checkbox"
                  checked={newFolder.access_permissions?.student || false}
                  onChange={(e) => setNewFolder({
                    ...newFolder,
                    access_permissions: {
                      ...newFolder.access_permissions!,
                      student: e.target.checked
                    }
                  })}
                  className="rounded"
                  disabled={newFolder.access_permissions?.all}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={addFolder}
            disabled={!newFolder.name}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Carpeta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}