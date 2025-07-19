
import { HomeIcon, GraduationCap, Users, Settings, BarChart3, Building2 } from "lucide-react";
import Index from "./pages/Index";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Universities from "./pages/Universities";
import UniversityDetail from "./pages/UniversityDetail";
import MobilityApplication from "./pages/MobilityApplication";
import ProfessorMobilityDetail from "./pages/ProfessorMobilityDetail";
import ProfessorMobilityApplication from "./pages/ProfessorMobilityApplication";

export const navItems = [
  {
    title: "Inicio",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Universidades",
    to: "/universities",
    icon: <Building2 className="h-4 w-4" />,
    page: <Universities />,
  },
  {
    title: "Universidad Detalle",
    to: "/university/:id",
    icon: <Building2 className="h-4 w-4" />,
    page: <UniversityDetail />,
  },
  {
    title: "Dashboard Estudiante",
    to: "/dashboard/student",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <StudentDashboard />,
    requiresAuth: true,
    allowedRoles: ["student"]
  },
  {
    title: "Dashboard Profesor",
    to: "/dashboard/professor",
    icon: <Users className="h-4 w-4" />,
    page: <ProfessorDashboard />,
    requiresAuth: true,
    allowedRoles: ["professor"]
  },
  {
    title: "Dashboard Coordinador",
    to: "/dashboard/coordinator",
    icon: <Settings className="h-4 w-4" />,
    page: <CoordinatorDashboard />,
    requiresAuth: true,
    allowedRoles: ["coordinator"]
  },
  {
    title: "Dashboard Admin",
    to: "/dashboard/admin",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AdminDashboard />,
    requiresAuth: true,
    allowedRoles: ["admin"]
  },
  {
    title: "Aplicación de Movilidad",
    to: "/apply/:universityId/:programId",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <MobilityApplication />,
    requiresAuth: true,
    allowedRoles: ["student"]
  },
  {
    title: "Detalle Movilidad Profesor",
    to: "/professor/mobility/detail/:callId",
    icon: <Users className="h-4 w-4" />,
    page: <ProfessorMobilityDetail />,
    requiresAuth: true,
    allowedRoles: ["professor"]
  },
  {
    title: "Aplicación Movilidad Profesor",
    to: "/professor/mobility/apply/:callId",
    icon: <Users className="h-4 w-4" />,
    page: <ProfessorMobilityApplication />,
    requiresAuth: true,
    allowedRoles: ["professor"]
  }
];
