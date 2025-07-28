
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { ProfessorMobilityApplicationFormEnhanced } from '@/components/professor/mobility/ProfessorMobilityApplicationFormEnhanced';
import { useAuth } from '@/hooks/useAuth';

const ProfessorMobilityApplication = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  if (!callId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          showLogout={true}
          userInfo={`Profesor: ${profile?.full_name}`}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Convocatoria no encontrada</h2>
                <p className="text-gray-600 mb-4">
                  El ID de la convocatoria no es válido.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => navigate('/dashboard/professor')} className="w-full">
                    Volver al Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Intentar de nuevo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSuccess = () => {
    navigate('/dashboard/professor');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        showLogout={true}
        userInfo={`Profesor: ${profile?.full_name}`}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/professor/mobility/detail/${callId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a los detalles
          </Button>
        </div>

        <ProfessorMobilityApplicationFormEnhanced 
          callId={callId} 
          onSuccess={handleSuccess}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfessorMobilityApplication;
