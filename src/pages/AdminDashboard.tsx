
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/UserManagement';
import { UniversityManagement } from '@/components/admin/UniversityManagement';
import { ProjectManagement } from '@/components/admin/ProjectManagement';
import { ProfessorMobilityManagement } from '@/components/admin/ProfessorMobilityManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import { EmailConfiguration } from '@/components/admin/EmailConfiguration';
import ReportsAnalytics from '@/components/admin/ReportsAnalytics';
import { Users, Building2, Briefcase, Plane, FileText, Mail, BarChart3, Menu } from 'lucide-react';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { value: 'users', label: 'Usuarios', icon: Users },
    { value: 'universities', label: 'Universidades', icon: Building2 },
    { value: 'projects', label: 'Proyectos', icon: Briefcase },
    { value: 'mobility', label: 'Movilidad', icon: Plane },
    { value: 'content', label: 'Contenido', icon: FileText },
    { value: 'email', label: 'Correo', icon: Mail },
    { value: 'reports', label: 'Reportes', icon: BarChart3 },
  ];

  const TabNavigation = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? 'flex flex-col space-y-2 p-4' : ''}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "ghost"}
            className={`${
              isMobile 
                ? 'w-full justify-start text-left' 
                : 'flex items-center gap-2'
            }`}
            onClick={() => {
              setActiveTab(tab.value);
              if (isMobile) setIsMobileMenuOpen(false);
            }}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showLogout={true}
        userInfo="Administrador"
      />
      
      <div className="container mx-auto py-4 px-4 sm:px-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administración</h1>
          
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Menú de Administración</h2>
                <TabNavigation isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-7 h-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="flex flex-col items-center gap-1 p-3 sm:flex-row sm:gap-2 text-xs sm:text-sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Mobile Active Tab Indicator */}
          <div className="md:hidden bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2">
              {(() => {
                const activeTabData = tabs.find(tab => tab.value === activeTab);
                const Icon = activeTabData?.icon || Users;
                return (
                  <>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{activeTabData?.label}</span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="space-y-6">
            <TabsContent value="users" className="space-y-0">
              <UserManagement />
            </TabsContent>

            <TabsContent value="universities" className="space-y-0">
              <UniversityManagement />
            </TabsContent>

            <TabsContent value="projects" className="space-y-0">
              <ProjectManagement />
            </TabsContent>

            <TabsContent value="mobility" className="space-y-0">
              <ProfessorMobilityManagement />
            </TabsContent>

            <TabsContent value="content" className="space-y-0">
              <ContentManagement />
            </TabsContent>

            <TabsContent value="email" className="space-y-0">
              <EmailConfiguration />
            </TabsContent>

            <TabsContent value="reports" className="space-y-0">
              <ReportsAnalytics />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
