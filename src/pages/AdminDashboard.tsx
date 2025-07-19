
import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import UserManagement from '@/components/admin/UserManagement';
import UniversityManagement from '@/components/admin/UniversityManagement';
import UniversityCoordinatorAssignment from '@/components/admin/UniversityCoordinatorAssignment';
import ProfessorMobilityManagement from '@/components/admin/ProfessorMobilityManagement';
import ConvenioAdminPanel from '@/components/admin/ConvenioAdminPanel';
import ProjectManagement from '@/components/admin/ProjectManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import EmailConfiguration from '@/components/admin/EmailConfiguration';
import EmailHistory from '@/components/admin/EmailHistory';
import EmailTemplateManager from '@/components/admin/EmailTemplateManager';
import ReportsAnalytics from '@/components/admin/ReportsAnalytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'universities':
        return <UniversityManagement />;
      case 'coordinators':
        return <UniversityCoordinatorAssignment />;
      case 'professor-mobility':
        return <ProfessorMobilityManagement />;
      case 'convenios-muevete':
        return <ConvenioAdminPanel />;
      case 'projects':
        return <ProjectManagement />;
      case 'content':
        return <ContentManagement />;
      case 'email-config':
        return <EmailConfiguration />;
      case 'email-history':
        return <EmailHistory />;
      case 'email-templates':
        return <EmailTemplateManager />;
      case 'reports':
        return <ReportsAnalytics />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
