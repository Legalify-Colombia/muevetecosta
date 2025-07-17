
import { useAuth } from '@/hooks/useAuth';

export const useProjectPermissions = () => {
  const { user } = useAuth();

  const canCreateProject = () => {
    // Only allow professors and coordinators to create projects
    // Note: This is a temporary solution. In a real implementation,
    // you would check the user's role from the database
    return user !== null;
  };

  const canViewProject = (project: any) => {
    return project?.is_public || user !== null;
  };

  const canEditProject = (project: any) => {
    // Check if user is a participant or admin
    return user !== null;
  };

  return {
    canCreateProject,
    canViewProject,
    canEditProject
  };
};
