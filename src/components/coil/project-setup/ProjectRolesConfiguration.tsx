import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Shield, Users, GraduationCap } from "lucide-react";

export interface ProjectRole {
  id: string;
  role_name: string;
  permissions: {
    can_manage_participants: boolean;
    can_create_assignments: boolean;
    can_grade_assignments: boolean;
    can_manage_documents: boolean;
    can_moderate_forums: boolean;
    can_view_all_submissions: boolean;
    can_edit_project: boolean;
  };
  description?: string;
  is_default: boolean;
}

export interface ProjectRolesInfo {
  roles: ProjectRole[];
}

interface ProjectRolesConfigurationProps {
  data: ProjectRolesInfo;
  onChange: (data: ProjectRolesInfo) => void;
}

const DEFAULT_ROLES: ProjectRole[] = [
  {
    id: "coordinator",
    role_name: "Profesor Coordinador",
    permissions: {
      can_manage_participants: true,
      can_create_assignments: true,
      can_grade_assignments: true,
      can_manage_documents: true,
      can_moderate_forums: true,
      can_view_all_submissions: true,
      can_edit_project: true,
    },
    description: "Rol principal con acceso completo al proyecto",
    is_default: true
  },
  {
    id: "collaborator",
    role_name: "Profesor Colaborador",
    permissions: {
      can_manage_participants: false,
      can_create_assignments: true,
      can_grade_assignments: true,
      can_manage_documents: true,
      can_moderate_forums: true,
      can_view_all_submissions: true,
      can_edit_project: false,
    },
    description: "Profesor participante con permisos de gestión limitados",
    is_default: true
  },
  {
    id: "student",
    role_name: "Estudiante",
    permissions: {
      can_manage_participants: false,
      can_create_assignments: false,
      can_grade_assignments: false,
      can_manage_documents: false,
      can_moderate_forums: false,
      can_view_all_submissions: false,
      can_edit_project: false,
    },
    description: "Participante estudiante del proyecto",
    is_default: true
  }
];

export default function ProjectRolesConfiguration({ data, onChange }: ProjectRolesConfigurationProps) {
  const [newRole, setNewRole] = useState<Partial<ProjectRole>>({
    role_name: "",
    description: "",
    permissions: {
      can_manage_participants: false,
      can_create_assignments: false,
      can_grade_assignments: false,
      can_manage_documents: false,
      can_moderate_forums: false,
      can_view_all_submissions: false,
      can_edit_project: false,
    }
  });

  // Inicializar con roles por defecto si no hay roles
  if (data.roles.length === 0) {
    onChange({ roles: DEFAULT_ROLES });
  }

  const addCustomRole = () => {
    if (!newRole.role_name) return;
    
    const role: ProjectRole = {
      id: crypto.randomUUID(),
      role_name: newRole.role_name,
      description: newRole.description,
      permissions: newRole.permissions!,
      is_default: false
    };

    onChange({
      roles: [...data.roles, role]
    });

    setNewRole({
      role_name: "",
      description: "",
      permissions: {
        can_manage_participants: false,
        can_create_assignments: false,
        can_grade_assignments: false,
        can_manage_documents: false,
        can_moderate_forums: false,
        can_view_all_submissions: false,
        can_edit_project: false,
      }
    });
  };

  const removeRole = (id: string) => {
    onChange({
      roles: data.roles.filter(role => role.id !== id && role.is_default)
    });
  };

  const updateRolePermission = (roleId: string, permission: keyof ProjectRole['permissions'], value: boolean) => {
    onChange({
      roles: data.roles.map(role => 
        role.id === roleId 
          ? { ...role, permissions: { ...role.permissions, [permission]: value }}
          : role
      )
    });
  };

  const updateNewRolePermission = (permission: keyof ProjectRole['permissions'], value: boolean) => {
    setNewRole({
      ...newRole,
      permissions: { ...newRole.permissions!, [permission]: value }
    });
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName.includes("Coordinador")) return <Shield className="h-4 w-4" />;
    if (roleName.includes("Colaborador")) return <Users className="h-4 w-4" />;
    if (roleName.includes("Estudiante")) return <GraduationCap className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const permissionLabels = {
    can_manage_participants: "Gestionar Participantes",
    can_create_assignments: "Crear Tareas",
    can_grade_assignments: "Calificar Tareas",
    can_manage_documents: "Gestionar Documentos",
    can_moderate_forums: "Moderar Foros",
    can_view_all_submissions: "Ver Todas las Entregas",
    can_edit_project: "Editar Proyecto",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Roles y Permisos</CardTitle>
        <CardDescription>
          Define los roles y permisos para los participantes del proyecto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Roles existentes */}
        <div className="space-y-4">
          <h4 className="font-medium">Roles del Proyecto</h4>
          
          {data.roles.map((role) => (
            <div key={role.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRoleIcon(role.role_name)}
                  <h5 className="font-medium">{role.role_name}</h5>
                  {role.is_default && (
                    <Badge variant="secondary">Por defecto</Badge>
                  )}
                </div>
                {!role.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRole(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {role.description && (
                <p className="text-sm text-muted-foreground">{role.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(permissionLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <Switch
                      checked={role.permissions[key as keyof ProjectRole['permissions']]}
                      onCheckedChange={(checked) => 
                        updateRolePermission(role.id, key as keyof ProjectRole['permissions'], checked)
                      }
                      disabled={role.is_default && role.id === "coordinator"} // Coordinador siempre tiene todos los permisos
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Formulario para agregar nuevo rol */}
        <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
          <h5 className="font-medium">Crear Rol Personalizado</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role_name">Nombre del Rol</Label>
              <Input
                id="role_name"
                value={newRole.role_name || ""}
                onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                placeholder="Ej: Mentor, Asistente, Invitado"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_description">Descripción</Label>
            <Textarea
              id="role_description"
              value={newRole.description || ""}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              placeholder="Describe las responsabilidades de este rol"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Permisos del Rol</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={newRole.permissions?.[key as keyof ProjectRole['permissions']] || false}
                    onCheckedChange={(checked) => 
                      updateNewRolePermission(key as keyof ProjectRole['permissions'], checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={addCustomRole}
            disabled={!newRole.role_name}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Rol
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}