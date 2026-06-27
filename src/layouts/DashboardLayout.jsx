import { Outlet } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';
import Noise from '../components/Noise';

export default function DashboardLayout() {
  return (
    <div className="dash-page font-sans selection:bg-[#FFFFFF]/30 selection:text-white min-h-screen">
      <style>{`
        .dashboard-exclusive-bg {
          position: fixed;
          inset: 0;
          background-color: #050505;
          z-index: -3;
        }

        .dashboard-exclusive-grid {
          position: fixed;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }

        .dashboard-exclusive-spotlight {
          position: fixed;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background: radial-gradient(circle at 50% -10%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
        }
      `}</style>

      <div className="dashboard-exclusive-bg" />
      <Noise opacity={0.04} />
      <div className="dashboard-exclusive-grid" />
      <div className="dashboard-exclusive-spotlight" />

      <DashboardNav />

      {/* Main content pushed down to avoid overlapping the fixed top nav */}
      <main className="pt-24 pb-16 px-4 md:px-8 w-full max-w-[1440px] mx-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
