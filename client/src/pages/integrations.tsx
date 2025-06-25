import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import ExternalIntegrations from '@/components/integrations/external-integrations';

export default function IntegrationsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <ExternalIntegrations />
      </div>
    </MainLayout>
  );
}