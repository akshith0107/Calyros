import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Scan, Activity, Brain, ArrowRight, ChevronRight, 
  Leaf, ShieldCheck, Cpu, Database, Blocks, CheckCircle2, 
  XCircle, FileSearch, Zap, Code
} from 'lucide-react';
import DNAParticleSystem from '../components/DNAParticleSystem';

/* --- Shared Components --- */
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-[#101010] border border-white/[0.08] rounded-xl ${className}`}>
    {children}
  </div>
);

/* --- Sections --- */
const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled ? 'bg-[#050505]/90 backdrop-blur-md border-white/[0.08] py-4' : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <Scan size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white uppercase letter-spacing-wide">Calyros AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-xs tracking-wider uppercase font-semibold text-[#A1A1A1]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#technology" className="hover:text-white transition-colors">Technology</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-[#A1A1A1] hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <button 
            onClick={() => {
              try { localStorage.removeItem('nutrimind_onboarding'); } catch(e) {}
              navigate('/onboarding/age');
            }}
            className="px-5 py-2 text-sm font-medium bg-white text-black hover:bg-[#EAEAEA] transition-colors rounded-md"
          >
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden">
      {/* Background visual: Monochromatic DNA */}
      <div className="absolute inset-0 z-0">
        <DNAParticleSystem className="opacity-70" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
              Nutrition Intelligence, <br className="hidden md:block" />
              Built Around You.
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-lg text-[#A1A1A1] mb-10 leading-relaxed font-light"
          >
            Analyze ingredients, nutrition labels, additives, allergens and health impact through AI-powered personalized nutrition intelligence.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <button 
              onClick={() => {
                try { localStorage.removeItem('nutrimind_onboarding'); } catch(e) {}
                navigate('/onboarding/age');
              }}
              className="w-full sm:w-auto px-8 py-3 bg-white text-black hover:bg-[#EAEAEA] transition-colors rounded-md font-medium text-sm"
            >
              Start Scanning
            </button>
            <a 
              href="#product"
              className="w-full sm:w-auto px-8 py-3 bg-transparent border border-white/[0.15] hover:border-white/40 text-white transition-colors rounded-md font-medium text-sm text-center"
            >
              View Demo
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="flex items-center gap-4 text-xs font-medium tracking-widest uppercase text-[#555555]"
          >
            <div className="h-[1px] w-8 bg-[#333333]" />
            Trusted Nutrition Intelligence Platform
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const PremiumProductPreview = () => {
  return (
    <section id="product" className="py-24 relative z-20 bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="rounded-xl border border-white/[0.08] bg-[#0B0B0B] overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-[#080808]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
            </div>
            <div className="text-[10px] font-medium tracking-widest uppercase text-[#555555] flex items-center gap-2">
              <Scan size={10} /> Scan Result
            </div>
            <div className="w-8" />
          </div>
          
          {/* Dashboard Body */}
          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col gap-8">
              <GlassCard className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-28 h-28 rounded-full border-[3px] border-[#333333] flex items-center justify-center mb-6 relative">
                  <span className="text-5xl font-light text-white">81</span>
                  {/* Static minimalist indicator instead of spinning loader */}
                  <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-white" />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-2">Health Score</h3>
                <p className="text-xs text-[#A1A1A1] leading-relaxed">Optimal configuration for Weight Loss goal parameters.</p>
              </GlassCard>
              
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Detected Variances</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#0B0B0B] border border-white/[0.05] px-4 py-3 rounded-lg">
                    <span className="text-xs text-[#A1A1A1]">Added Sugar</span>
                    <span className="text-xs font-semibold text-white">12g</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0B0B0B] border border-white/[0.05] px-4 py-3 rounded-lg">
                    <span className="text-xs text-[#A1A1A1]">Soy Lecithin</span>
                    <span className="text-xs font-semibold text-white">Additive</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 flex flex-col gap-8">
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-sm font-semibold tracking-wide uppercase text-white flex items-center gap-3">
                    <Activity size={16} className="text-[#A1A1A1]" /> Nutritional Vector
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Calories', val: '240', unit: 'kcal' },
                    { label: 'Protein', val: '18', unit: 'g' },
                    { label: 'Carbs', val: '22', unit: 'g' },
                    { label: 'Fat', val: '8', unit: 'g' },
                  ].map((n, i) => (
                    <div key={i} className="border-l border-white/[0.08] pl-5 py-2">
                      <div className="text-2xl font-light text-white mb-1">{n.val}<span className="text-[10px] text-[#555555] ml-1">{n.unit}</span></div>
                      <div className="text-[10px] text-[#A1A1A1] font-bold uppercase tracking-widest">{n.label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-8">
                <h4 className="text-sm font-semibold tracking-wide uppercase text-white mb-6 flex items-center gap-3">
                  <Brain size={16} className="text-[#A1A1A1]" /> Intelligence Output
                </h4>
                <p className="text-sm text-[#A1A1A1] leading-relaxed mb-6">
                  Based on target goal [Muscle Gain], this product provides an optimal protein-to-calorie ratio. The presence of whey isolate ensures high bioavailability. Recommended pairing with complex carbohydrates to mitigate deficit.
                </p>
                <div className="flex gap-3">
                  <span className="px-3 py-1.5 bg-white/5 border border-white/[0.08] rounded text-[10px] tracking-wider uppercase font-semibold text-[#A1A1A1]">Muscle Gain Support</span>
                  <span className="px-3 py-1.5 bg-white/5 border border-white/[0.08] rounded text-[10px] tracking-wider uppercase font-semibold text-[#A1A1A1]">High Bioavailability</span>
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureHighlights = () => {
  const features = [
    { icon: FileSearch, title: 'Nutrition Analysis', desc: 'Extract and structure macros and micronutrients from any label instantly.' },
    { icon: Blocks, title: 'Ingredient Intelligence', desc: 'Identify hidden additives, refined oils, and ultra-processed components.' },
    { icon: ShieldCheck, title: 'Allergen Detection', desc: 'Automatic flagging of specific allergens mapped to your personal profile.' },
    { icon: Activity, title: 'Condition Awareness', desc: 'Scores adapted dynamically based on precise metabolic and dietary goals.' },
    { icon: Brain, title: 'AI Nutrition Assistant', desc: 'Query your scanned food directly via natural language processing.' },
    { icon: Leaf, title: 'Smart Alternatives', desc: 'Discover algorithmically matched whole-food equivalents.' },
  ];

  return (
    <section id="features" className="py-32 relative bg-[#0B0B0B] border-y border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">Core Infrastructure</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 1 }}
            >
              <GlassCard className="p-8 h-full hover:bg-white/[0.02] transition-colors group">
                <feat.icon size={20} className="text-white mb-8" strokeWidth={1.5} />
                <h3 className="text-base font-medium text-white mb-3">{feat.title}</h3>
                <p className="text-[#A1A1A1] text-sm leading-relaxed font-light">{feat.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyCalyrosSection = () => {
  return (
    <section className="py-32 relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">Paradigm Shift</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/[0.08] border border-white/[0.08] overflow-hidden rounded-xl">
          {/* Traditional Apps */}
          <div className="p-12 bg-[#050505]">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-[#555555] mb-10">
              Traditional Food Apps
            </h3>
            <ul className="space-y-6">
              {['Generic calorie counting', 'Static nutrition data', 'No ingredient intelligence', 'No health awareness'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-[#A1A1A1] text-sm">
                  <XCircle size={16} className="text-[#333333] shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Calyros AI */}
          <div className="p-12 bg-[#0A0A0A]">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-white mb-10">
              Calyros AI
            </h3>
            <ul className="space-y-6">
              {['Personalized recommendations', 'Ingredient intelligence', 'Health-condition aware', 'AI-powered reasoning'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-white text-sm">
                  <CheckCircle2 size={16} className="text-white shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const TechnologySection = () => {
  const tech = [
    { name: 'Gemini Vision', icon: Scan },
    { name: 'Groq Inference', icon: Zap },
    { name: 'FastAPI', icon: Cpu },
    { name: 'PostgreSQL', icon: Database },
    { name: 'Supabase', icon: ShieldCheck },
    { name: 'React', icon: Blocks },
  ];

  return (
    <section id="technology" className="py-24 border-t border-white/[0.05] bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-xs font-bold tracking-widest uppercase text-[#555555] mb-12">Technology Stack</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {tech.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <t.icon size={16} className="text-[#333333]" strokeWidth={1.5} />
              <span className="text-sm font-medium text-[#A1A1A1]">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LandingFooter = () => (
  <footer className="py-12 border-t border-white/[0.05] bg-[#050505]">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-3">
        <Scan size={18} className="text-white" />
        <span className="font-semibold text-sm tracking-widest uppercase text-white">Calyros AI</span>
      </div>
      
      <div className="flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-[#A1A1A1]">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#technology" className="hover:text-white transition-colors">Technology</a>
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
        <a href="#" className="hover:text-white transition-colors">Contact</a>
        <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Code size={14} /> GitHub</a>
      </div>
      
      <div className="text-xs text-[#555555]">
        © {new Date().getFullYear()} Calyros AI.
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="bg-[#050505] min-h-screen font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <PremiumProductPreview />
      <FeatureHighlights />
      <WhyCalyrosSection />
      <TechnologySection />
      <LandingFooter />
    </div>
  );
}
