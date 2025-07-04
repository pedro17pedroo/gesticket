import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import AdvancedReports from '@/components/reports/advanced-reports';

export default function AdvancedReportsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <AdvancedReports />
      </div>
    </MainLayout>
  );
}