import dynamic from 'next/dynamic';

const DashboardContent = dynamic(() => import('@/components/dashboard/DashboardContent').then(mod => ({ default: mod.DashboardContent })), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>,
});

export default function DashboardPage() {
  return <DashboardContent />;
}
