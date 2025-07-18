
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { MobilityOpportunityDetail } from '@/components/professor/mobility/MobilityOpportunityDetail';
import { useAuth } from '@/hooks/useAuth';

const ProfessorMobilityDetail = () => {
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
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Convocatoria no encontrada</h2>
            <Button onClick={() => navigate('/dashboard/professor')}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            onClick={() => navigate('/dashboard/professor')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>

        <MobilityOpportunityDetail callId={callId} />
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfessorMobilityDetail;
