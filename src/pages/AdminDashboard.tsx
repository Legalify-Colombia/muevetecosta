
import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Header from '@/components/common/Header';
import { UserManagement } from '@/components/admin/UserManagement';
import { UniversityManagement } from '@/components/admin/UniversityManagement';
import { ProfessorMobilityManagement } from '@/components/admin/ProfessorMobilityManagement';
import ConvenioAdminPanel from '@/components/admin/ConvenioAdminPanel';
import { ProjectManagement } from '@/components/admin/ProjectManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import { EmailConfiguration } from '@/components/admin/EmailConfiguration';
import { EmailHistory } from '@/components/admin/EmailHistory';
import { EmailTemplateManager } from '@/components/admin/EmailTemplateManager';
import ReportsAnalytics from '@/components/admin/ReportsAnalytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'universities':
        return <UniversityManagement />;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación responsive */}
      <Header 
        showLogout={true} 
        userInfo="Administrador"
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - oculto en móvil, mostrado en desktop */}
        <div className="hidden md:block">
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Navegación móvil */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex overflow-x-auto px-2 py-2 space-x-1">
            {[
              { id: 'users', label: 'Usuarios', icon: '👥' },
              { id: 'universities', label: 'Universidades', icon: '🏫' },
              { id: 'professor-mobility', label: 'Movilidad', icon: '✈️' },
              { id: 'convenios-muevete', label: 'Convenios', icon: '📋' },
              { id: 'projects', label: 'Proyectos', icon: '📁' },
              { id: 'content', label: 'Contenido', icon: '📄' },
              { id: 'email-config', label: 'Email', icon: '📧' },
              { id: 'reports', label: 'Reportes', icon: '📊' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span className="truncate max-w-16">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
