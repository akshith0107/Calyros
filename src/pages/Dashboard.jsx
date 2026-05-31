import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardNav from '../components/DashboardNav';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import HealthScoreRing from '../components/HealthScoreRing';
import ScannerOverlay from '../components/scanner/ScannerOverlay';

/* ── Animation variants ── */
const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

/* ── Static data (simulated) ── */
const profileData = {
  age: 24,
  gender: 'Male',
  conditions: 'None',
  allergies: 'Gluten, Dairy',
  diet: 'Mediterranean',
  activity: 'Moderately Active',
};

const recommendations = [
  { id: 1, text: 'Reduce daily sugar intake by 15 g to align with your health goals.', tag: 'Nutrition' },
  { id: 2, text: 'Increase protein consumption to support your activity level.', tag: 'Protein' },
  { id: 3, text: 'Monitor sodium — recent scans show elevated levels.', tag: 'Sodium' },
  { id: 4, text: 'Consider adding more fiber-rich foods to your diet.', tag: 'Fiber' },
];

const initialRecentScans = [
  { id: 1, name: 'Organic Greek Yogurt', score: 87, date: 'May 30, 2026' },
  { id: 2, name: 'Almond Butter Spread', score: 74, date: 'May 29, 2026' },
  { id: 3, name: 'Whole Grain Cereal', score: 68, date: 'May 28, 2026' },
];

const savedProducts = [
  { id: 1, name: 'Oat Milk Original', score: 91 },
  { id: 2, name: 'Quinoa Puffs', score: 84 },
  { id: 3, name: 'Dark Chocolate 85%', score: 78 },
];

const alternatives = [
  { original: 'Coca-Cola Classic', suggestion: 'Sparkling Water + Lemon', improvement: '+62%' },
  { original: 'White Bread', suggestion: 'Sourdough Whole Grain', improvement: '+38%' },
  { original: 'Instant Noodles', suggestion: 'Buckwheat Soba', improvement: '+45%' },
];

/* ── Helpers ── */
function scoreColor(s) {
  if (s >= 80) return 'var(--color-success)';
  if (s >= 60) return 'var(--color-warning)';
  return 'var(--color-error)';
}

function ScorePill({ score }) {
  return (
    <span className="dash-score-pill" style={{ color: scoreColor(score), background: `color-mix(in srgb, ${scoreColor(score)} 12%, transparent)` }}>
      {score}
    </span>
  );
}

/* ── Page ── */
export default function Dashboard() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [recentScans, setRecentScans] = useState(initialRecentScans);
  
  // Calculate average score dynamically based on recent scans
  const avgScore = Math.round(recentScans.reduce((acc, scan) => acc + scan.score, 0) / recentScans.length) || 0;

  const handleSaveResult = (result) => {
    const { ocrData, aiAnalysis } = result;
    const newScan = {
      id: Date.now(),
      name: ocrData.productName,
      score: aiAnalysis.healthScore,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    // Add to top of recent scans
    setRecentScans([newScan, ...recentScans]);
  };

  return (
    <div className="dash-page">
      <DashboardNav />

      <main className="dash-main">
        {/* Welcome */}
        <motion.header
          className="dash-welcome"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="dash-welcome-title">Welcome Back, Akshith</h1>
          <p className="dash-welcome-sub">Your personalized nutrition intelligence dashboard.</p>
        </motion.header>

        {/* Grid */}
        <motion.div
          className="dash-grid"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >

          {/* ─── Card 1 · Health Profile ─── */}
          <motion.div variants={cardVariant} className="dash-cell dash-cell--profile">
            <GlassCard className="dash-card" hoverable={false}>
              <div className="dash-card-head">
                <h2 className="dash-card-title">Health Profile</h2>
                <Button variant="secondary" className="dash-card-action">Edit Profile</Button>
              </div>
              <div className="dash-profile-grid">
                {Object.entries(profileData).map(([key, val]) => (
                  <div className="dash-profile-row" key={key}>
                    <span className="dash-profile-label">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                    <span className="dash-profile-value">{val}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* ─── Card 2 · Quick Scan ─── */}
          <motion.div variants={cardVariant} className="dash-cell dash-cell--scan">
            <GlassCard className="dash-card dash-card--cta" hoverable={false}>
              <div className="dash-scan-content">
                <div>
                  <h2 className="dash-card-title text-xl mb-2">Scan Nutrition Label</h2>
                  <p className="dash-card-desc">Capture or upload a product's nutrition label to receive AI-powered health analysis personalized to your profile.</p>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="primary" size="large" onClick={() => setIsScannerOpen(true)}>
                    <svg className="w-5 h-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Open Camera
                  </Button>
                  <Button variant="secondary" size="large" onClick={() => setIsScannerOpen(true)}>
                    Upload Image
                  </Button>
                </div>
              </div>
              {/* decorative corner accent */}
              <div className="dash-scan-accent" aria-hidden="true" />
            </GlassCard>
          </motion.div>

          {/* ─── Card 3 · Health Score ─── */}
          <motion.div variants={cardVariant} className="dash-cell dash-cell--score">
            <GlassCard className="dash-card dash-card--center" hoverable={false}>
              <h2 className="dash-card-title">Health Score</h2>
              <HealthScoreRing score={avgScore} size={152} strokeWidth={5} />
              <p className="dash-card-desc" style={{ marginTop: 'var(--space-4)' }}>
                Based on your profile and {recentScans.length} recent scans.
              </p>
            </GlassCard>
          </motion.div>

          {/* ─── Card 4 · AI Recommendations ─── */}
          <motion.div variants={cardVariant} className="dash-cell dash-cell--recs">
            <GlassCard className="dash-card" hoverable={false}>
              <div className="dash-card-head">
                <h2 className="dash-card-title">AI Recommendations</h2>
              </div>
              <ul className="dash-rec-list">
                {recommendations.map((r) => (
                  <li className="dash-rec-item" key={r.id}>
                    <span className="dash-rec-tag">{r.tag}</span>
                    <span className="dash-rec-text">{r.text}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>

          {/* ─── Card 5 · Recent Analyses ─── */}
          <motion.div variants={cardVariant} className="dash-cell dash-cell--recent">
            <GlassCard className="dash-card" hoverable={false}>
              <div className="dash-card-head">
                <h2 className="dash-card-title">Recent Analyses</h2>
                <Button variant="secondary" className="dash-card-action">View All</Button>
              </div>
              <div className="dash-table">
                <div className="dash-table-header">
                  <span>Product</span>
                  <span>Score</span>
                  <span>Date</span>
                </div>
                {recentScans.slice(0, 4).map((s) => (
                  <div className="dash-table-row" key={s.id}>
                    <span className="dash-table-cell-name">{s.name}</span>
                    <span><ScorePill score={s.score} /></span>
                    <span className="dash-table-cell-date">{s.date}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* ─── Card 6 · Saved Products ─── */}
          <motion.div variants={cardVariant} className="dash-cell dash-cell--saved">
            <GlassCard className="dash-card" hoverable={false}>
              <div className="dash-card-head">
                <h2 className="dash-card-title">Saved Products</h2>
              </div>
              <div className="dash-saved-list">
                {savedProducts.map((p) => (
                  <div className="dash-saved-item" key={p.id}>
                    <span className="dash-saved-name">{p.name}</span>
                    <ScorePill score={p.score} />
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* ─── Card 7 · Alternative Suggestions ─── */}
          <motion.div variants={cardVariant} className="dash-cell dash-cell--alts">
            <GlassCard className="dash-card" hoverable={false}>
              <div className="dash-card-head">
                <h2 className="dash-card-title">Smarter Alternatives</h2>
              </div>
              <div className="dash-alt-list">
                {alternatives.map((a, i) => (
                  <div className="dash-alt-row" key={i}>
                    <div className="dash-alt-pair">
                      <span className="dash-alt-original">{a.original}</span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dash-alt-arrow" aria-hidden="true">
                        <path d="M1 7h12M8 2l5 5-5 5"/>
                      </svg>
                      <span className="dash-alt-suggestion">{a.suggestion}</span>
                    </div>
                    <span className="dash-alt-improvement">{a.improvement}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* ─── Card 8 · Activity & Goals ─── */}
          <motion.div variants={cardVariant} className="dash-cell dash-cell--goals">
            <GlassCard className="dash-card" hoverable={false}>
              <div className="dash-card-head">
                <h2 className="dash-card-title">Activity & Goals</h2>
              </div>
              <div className="dash-goals-list">
                <div className="dash-goals-item">
                  <span className="dash-goals-label">Current Goal</span>
                  <span className="dash-goals-value">Eat Healthier</span>
                </div>
                <div className="dash-goals-item">
                  <span className="dash-goals-label">Activity Level</span>
                  <span className="dash-goals-value">Moderately Active</span>
                </div>
                <div className="dash-goals-item">
                  <span className="dash-goals-label">Weekly Progress</span>
                  <div className="dash-goals-bar-wrap">
                    <div className="dash-goals-bar">
                      <motion.div
                        className="dash-goals-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: '68%' }}
                        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.6 }}
                      />
                    </div>
                    <span className="dash-goals-bar-label">68%</span>
                  </div>
                </div>
                <div className="dash-goals-item">
                  <span className="dash-goals-label">Products Scanned This Week</span>
                  <span className="dash-goals-value">{recentScans.length}</span>
                </div>
                <div className="dash-goals-item">
                  <span className="dash-goals-label">Avg. Health Score</span>
                  <span className="dash-goals-value" style={{ color: 'var(--color-success)' }}>{avgScore}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </main>

      <ScannerOverlay 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onSaveResult={handleSaveResult}
      />
    </div>
  );
}
