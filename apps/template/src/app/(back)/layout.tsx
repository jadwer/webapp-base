"use client";

import AuthenticatedLayout from "@/modules/auth/components/AuthenticatedLayout";
import DashboardLayout from '@/ui/components/DashboardLayout'

export default function BackPage({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedLayout>
          <DashboardLayout>

        {children}
        </DashboardLayout>
    </AuthenticatedLayout>
  );
}
