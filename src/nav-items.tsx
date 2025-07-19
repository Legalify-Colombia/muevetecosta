
import { Home, Users, GraduationCap, BookOpen, Building2, LogIn, UserPlus } from "lucide-react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Universities from "./pages/Universities";
import UniversityDetail from "./pages/UniversityDetail";
import MobilityApplication from "./pages/MobilityApplication";
import ProfessorMobilityApplication from "./pages/ProfessorMobilityApplication";
import ProfessorMobilityDetail from "./pages/ProfessorMobilityDetail";
import TermsAndConditions from "./pages/TermsAndConditions";
import DynamicPage from "./pages/DynamicPage";
import NotFound from "./pages/NotFound";

export interface NavItem {
  title: string;
  to: string;
  icon: any;
  page: JSX.Element;
  requiresAuth?: boolean;
  allowedRoles?: string[];
}

export const navItems: NavItem[] = [
  {
    title: "Inicio",
    to: "/",
    icon: Home,
    page: <Index />,
  },
  {
    title: "Iniciar Sesión",
    to: "/login",
    icon: LogIn,
    page: <Login />,
  },
  {
    title: "Registrarse",
    to: "/register",
    icon: UserPlus,
    page: <Register />,
  },
  {
    title: "Dashboard Estudiante",
    to: "/dashboard/student",
    icon: Users,
    page: <StudentDashboard />,
    requiresAuth: true,
    allowedRoles: ["student"],
  },
  {
    title: "Dashboard Coordinador",
    to: "/dashboard/coordinator",
    icon: GraduationCap,
    page: <CoordinatorDashboard />,
    requiresAuth: true,
    allowedRoles: ["coordinator"],
  },
  {
    title: "Dashboard Profesor",
    to: "/dashboard/professor",
    icon: BookOpen,
    page: <ProfessorDashboard />,
    requiresAuth: true,
    allowedRoles: ["professor"],
  },
  {
    title: "Dashboard Admin",
    to: "/dashboard/admin",
    icon: Users,
    page: <AdminDashboard />,
    requiresAuth: true,
    allowedRoles: ["admin"],
  },
  {
    title: "Universidades",
    to: "/universities",
    icon: Building2,
    page: <Universities />,
  },
  {
    title: "Detalle Universidad",
    to: "/universities/:id",
    icon: Building2,
    page: <UniversityDetail />,
  },
  {
    title: "Aplicación de Movilidad",
    to: "/mobility/apply",
    icon: Users,
    page: <MobilityApplication />,
    requiresAuth: true,
    allowedRoles: ["student"],
  },
  {
    title: "Movilidad Profesor - Aplicación",
    to: "/professor-mobility/apply",
    icon: BookOpen,
    page: <ProfessorMobilityApplication />,
    requiresAuth: true,
    allowedRoles: ["professor"],
  },
  {
    title: "Movilidad Profesor - Detalle",
    to: "/professor-mobility/:id",
    icon: BookOpen,
    page: <ProfessorMobilityDetail />,
    requiresAuth: true,
  },
  {
    title: "Términos y Condiciones",
    to: "/terms",
    icon: BookOpen,
    page: <TermsAndConditions />,
  },
  {
    title: "Página Dinámica",
    to: "/page/:slug",
    icon: BookOpen,
    page: <DynamicPage />,
  },
  {
    title: "No Encontrado",
    to: "*",
    icon: Home,
    page: <NotFound />,
  },
];
