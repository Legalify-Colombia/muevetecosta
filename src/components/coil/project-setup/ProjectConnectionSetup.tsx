import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface MeetingLink {
  id: string;
  name: string;
  url: string;
  date?: Date;
  description?: string;
  isRecurring: boolean;
}

export interface ProjectConnectionInfo {
  meeting_platform: string;
  meeting_links: MeetingLink[];
}

interface ProjectConnectionSetupProps {
  data: ProjectConnectionInfo;
  onChange: (data: ProjectConnectionInfo) => void;
}

export default function ProjectConnectionSetup({ data, onChange }: ProjectConnectionSetupProps) {
  const [newLink, setNewLink] = useState<Partial<MeetingLink>>({
    name: "",
    url: "",
    isRecurring: false
  });

  const addMeetingLink = () => {
    if (!newLink.name || !newLink.url) return;
    
    const link: MeetingLink = {
      id: crypto.randomUUID(),
      name: newLink.name,
      url: newLink.url,
      date: newLink.date,
      description: newLink.description,
      isRecurring: newLink.isRecurring || false
    };

    onChange({
      ...data,
      meeting_links: [...data.meeting_links, link]
    });

    setNewLink({
      name: "",
      url: "",
      isRecurring: false
    });
  };

  const removeMeetingLink = (id: string) => {
    onChange({
      ...data,
      meeting_links: data.meeting_links.filter(link => link.id !== id)
    });
  };

  const updatePlatform = (platform: string) => {
    onChange({ ...data, meeting_platform: platform });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Conexiones</CardTitle>
        <CardDescription>
          Configure los enlaces de videoconferencia y reuniones virtuales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Plataforma Principal de Videoconferencia</Label>
          <Select value={data.meeting_platform} onValueChange={updatePlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="teams">Microsoft Teams</SelectItem>
              <SelectItem value="meet">Google Meet</SelectItem>
              <SelectItem value="other">Otra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Enlaces de Reunión</h4>
          
          {/* Lista de enlaces existentes */}
          {data.meeting_links.length > 0 && (
            <div className="space-y-3">
              {data.meeting_links.map((link) => (
                <div key={link.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{link.name}</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMeetingLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                  {link.date && (
                    <p className="text-sm text-muted-foreground">
                      📅 {format(link.date, "PPP")}
                    </p>
                  )}
                  {link.description && (
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  )}
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {link.isRecurring ? "Recurrente" : "Fecha específica"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para agregar nuevo enlace */}
          <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
            <h5 className="font-medium">Agregar Nuevo Enlace</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link_name">Nombre del Enlace</Label>
                <Input
                  id="link_name"
                  value={newLink.name || ""}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  placeholder="Ej: Reunión Semanal, Sesión Introductoria"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link_url">URL de la Reunión</Label>
                <Input
                  id="link_url"
                  value={newLink.url || ""}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Reunión</Label>
              <Select 
                value={newLink.isRecurring ? "recurring" : "specific"} 
                onValueChange={(value) => setNewLink({ ...newLink, isRecurring: value === "recurring" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de reunión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recurring">Enlace Recurrente</SelectItem>
                  <SelectItem value="specific">Fecha Específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!newLink.isRecurring && (
              <div className="space-y-2">
                <Label>Fecha de la Reunión</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newLink.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newLink.date ? format(newLink.date, "PPP") : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newLink.date}
                      onSelect={(date) => setNewLink({ ...newLink, date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="link_description">Descripción (Opcional)</Label>
              <Textarea
                id="link_description"
                value={newLink.description || ""}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                placeholder="Descripción adicional de la reunión"
                rows={2}
              />
            </div>

            <Button 
              onClick={addMeetingLink}
              disabled={!newLink.name || !newLink.url}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Enlace
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}