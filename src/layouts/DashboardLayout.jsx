import { Outlet } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';
import Noise from '../components/Noise';

export default function DashboardLayout() {
  return (
    <div className="dash-page">
      <style>{`
        /* Hide global particles on dashboard layout */
        .particle-canvas {
          display: none !important;
        }
        
        /* The matte black luxury background */
        .dashboard-exclusive-bg {
          position: fixed;
          inset: 0;
          background-color: #070707;
          z-index: -3;
        }

        /* The refined architectural grid */
        .dashboard-exclusive-grid {
          position: fixed;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background-size: 55px 55px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 90%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 90%);
        }

        /* Subtle dark amber radial spotlight for depth */
        .dashboard-exclusive-spotlight {
          position: fixed;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background: radial-gradient(circle at 50% 30%, rgba(212, 115, 30, 0.015) 0%, transparent 60%);
        }
      `}</style>

      <div className="dashboard-exclusive-bg" />
      <Noise opacity={0.035} />
      <div className="dashboard-exclusive-grid" />
      <div className="dashboard-exclusive-spotlight" />

      <DashboardNav />

      {/* Renders the matching child route inside the main content area */}
      <Outlet />
    </div>
  );
}
