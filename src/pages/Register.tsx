import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEmail } from '@/hooks/useEmail';

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  documentType: z.enum(["cc", "ti", "passport", "ce"]),
  documentNumber: z.string().min(5, {
    message: "El número de documento debe tener al menos 5 caracteres.",
  }),
  phone: z.string().min(7, {
    message: "El número de teléfono debe tener al menos 7 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un correo electrónico válido.",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres.",
  }),
  role: z.enum(["professor", "student"]), // Solo profesores y estudiantes
  originUniversity: z.string().optional(),
  academicProgram: z.string().optional(),
  currentSemester: z.string().optional(),
})

export default function Register() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const { sendWelcomeEmail } = useEmail();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      documentType: "cc",
      documentNumber: "",
      phone: "",
      email: "",
      password: "",
      role: "student",
      originUniversity: "",
      academicProgram: "",
      currentSemester: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    console.log('Starting registration process with:', { email: values.email, role: values.role });

    try {
      const userData = {
        full_name: values.fullName,
        document_type: values.documentType,
        document_number: values.documentNumber,
        phone: values.phone,
        role: values.role,
        origin_university: values.role === 'student' ? values.originUniversity : undefined,
        academic_program: values.role === 'student' ? values.academicProgram : undefined,
        current_semester: values.role === 'student' ? parseInt(values.currentSemester || '0') : undefined
      };

      console.log('Calling signUp with userData:', userData);

      const { error } = await signUp(values.email, values.password, userData);
      
      if (error) {
        console.error('Registration error:', error);
        setError(error.message);
        toast({
          title: "Error en el registro",
          description: error.message || "No se pudo completar el registro",
          variant: "destructive",
        });
        return;
      }

      // Send welcome email - don't block if it fails
      try {
        const emailResult = await sendWelcomeEmail(values.email, values.fullName);
        if (emailResult.success) {
          console.log('Welcome email sent successfully');
        } else {
          console.warn('Welcome email was not sent:', emailResult.error);
        }
      } catch (emailError) {
        console.warn('Warning: Could not send welcome email (non-critical):', emailError);
        // Email failure is not critical - user can still use the platform
      }

      console.log('Registration successful');
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Revisa tu correo electrónico para activarla.",
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError('Error en el proceso de registro');
      toast({
        title: "Error en el registro",
        description: "Ocurrió un error inesperado durante el registro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/LogoM.png" 
                alt="Muévete por el Caribe" 
                className="h-12 w-auto"
              />
            </div>
            <CardTitle className="text-center">Crear una cuenta</CardTitle>
            <CardDescription className="text-center">
              Registro para estudiantes y profesores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cc">Cédula de Ciudadanía</SelectItem>
                          <SelectItem value="ti">Tarjeta de Identidad</SelectItem>
                          <SelectItem value="passport">Pasaporte</SelectItem>
                          <SelectItem value="ce">Cédula de Extranjería</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Documento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu número de documento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu número de teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu correo electrónico" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu contraseña" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Usuario</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Estudiante</SelectItem>
                          <SelectItem value="professor">Profesor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.getValues("role") === "student" && (
                  <>
                    <FormField
                      control={form.control}
                      name="originUniversity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Universidad de Origen</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingresa tu universidad de origen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="academicProgram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Programa Académico</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingresa tu programa académico" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currentSemester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Semestre Actual</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingresa tu semestre actual" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Crear cuenta
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

