
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileText, GraduationCap, Calendar, Plus, Edit, Trash2 } from "lucide-react";

export const ContentManagement = () => {
  const [newDocumentType, setNewDocumentType] = useState("");
  const [newProgram, setNewProgram] = useState("");

  // Mock data - estos datos vendrían de la base de datos
  const documentTypes = [
    { id: 'cc', name: 'Cédula de Ciudadanía', active: true },
    { id: 'ti', name: 'Tarjeta de Identidad', active: true },
    { id: 'passport', name: 'Pasaporte', active: true },
    { id: 'ce', name: 'Cédula de Extranjería', active: true },
  ];

  const basePrograms = [
    { id: 1, name: 'Ingeniería de Sistemas', active: true },
    { id: 2, name: 'Administración de Empresas', active: true },
    { id: 3, name: 'Derecho', active: true },
    { id: 4, name: 'Medicina', active: true },
    { id: 5, name: 'Psicología', active: true },
  ];

  const semesters = [
    { id: 1, name: 'Primer Semestre', active: true },
    { id: 2, name: 'Segundo Semestre', active: true },
    { id: 3, name: 'Tercer Semestre', active: true },
    { id: 4, name: 'Cuarto Semestre', active: true },
    { id: 5, name: 'Quinto Semestre', active: true },
    { id: 6, name: 'Sexto Semestre', active: true },
    { id: 7, name: 'Séptimo Semestre', active: true },
    { id: 8, name: 'Octavo Semestre', active: true },
    { id: 9, name: 'Noveno Semestre', active: true },
    { id: 10, name: 'Décimo Semestre', active: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración de Contenidos</h2>
        <p className="text-gray-600">Administra catálogos y configuración general del sistema</p>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Tipos de Documento</TabsTrigger>
          <TabsTrigger value="programs">Programas Académicos</TabsTrigger>
          <TabsTrigger value="semesters">Semestres</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Tipos de Documento de Identidad
              </CardTitle>
              <CardDescription>
                Gestiona los tipos de documentos válidos para el registro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nuevo tipo de documento..."
                  value={newDocumentType}
                  onChange={(e) => setNewDocumentType(e.target.value)}
                />
                <Button onClick={() => setNewDocumentType("")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentTypes.map((docType) => (
                    <TableRow key={docType.id}>
                      <TableCell className="font-mono">{docType.id}</TableCell>
                      <TableCell>{docType.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={docType.active ? "default" : "secondary"}
                          className={docType.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {docType.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Programas Académicos Base
              </CardTitle>
              <CardDescription>
                Catálogo general de programas que pueden asociarse a las universidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nuevo programa académico..."
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                />
                <Button onClick={() => setNewProgram("")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre del Programa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {basePrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-mono">#{program.id}</TableCell>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={program.active ? "default" : "secondary"}
                          className={program.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {program.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semesters">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Configuración de Semestres
              </CardTitle>
              <CardDescription>
                Gestiona los semestres académicos disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semesters.map((semester) => (
                    <TableRow key={semester.id}>
                      <TableCell className="font-mono">{semester.id}</TableCell>
                      <TableCell>{semester.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={semester.active ? "default" : "secondary"}
                          className={semester.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {semester.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
