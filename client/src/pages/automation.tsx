import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import AutomationRules from '@/components/automation/automation-rules';

export default function AutomationPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <AutomationRules />
      </div>
    </MainLayout>
  );
}