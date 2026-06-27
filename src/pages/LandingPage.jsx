import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, animate, useInView } from 'framer-motion';
import { 
  Scan, ArrowRight, Eye, Blocks, HeartPulse, Activity, Leaf, MessageSquare, Database, Sparkles
} from 'lucide-react';
import DNAParticleSystem from '../components/DNAParticleSystem';
import { useAuth } from '../contexts/AuthContext';

/* --- Shared Components --- */
const GlassCard = ({ children, className = '' }) => (
  <div className={`relative bg-[#080808] border border-white/[0.15] rounded-[24px] overflow-hidden group transition-all duration-500 hover:border-white/[0.25] shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:shadow-[0_0_40px_rgba(109,94,245,0.12)] ${className}`}>
    <div className="absolute inset-0 bg-grain pointer-events-none" />
    {/* Subtle Purple card hover glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#6D5EF5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="relative z-10">{children}</div>
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? 'bg-[#050505]/70 backdrop-blur-xl border-b border-white/[0.05] py-4' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="w-8 h-8 flex items-center justify-center border border-white/[0.1] rounded-full group-hover:border-white/[0.3] transition-colors bg-[#080808]">
            <Scan size={14} className="text-white" />
          </div>
          <span className="font-sans font-medium text-sm tracking-widest text-white uppercase">Calyros AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.2em] uppercase font-medium text-[rgba(255,255,255,0.48)]">
          <a href="#platform" className="hover:text-white transition-colors">Platform</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              try { localStorage.removeItem('nutrimind_onboarding'); } catch(e) {}
              navigate('/onboarding/age');
            }}
            className="px-6 py-2.5 text-xs font-semibold tracking-wider uppercase bg-white text-black hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all rounded-full"
          >
            Launch App
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="relative min-h-[100vh] pt-32 pb-20 flex flex-col justify-center overflow-hidden bg-[#050505]">
      {/* Massive Purple Accent Glow */}
      <div className="glow-purple-massive" />
      
      {/* Background Grain & Grid */}
      <div className="absolute inset-0 bg-grain pointer-events-none z-10" />
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none z-0" />

      {/* Center-Right Crisp DNA Helix */}
      <div className="absolute inset-y-0 right-0 w-full md:w-[60%] z-20 flex items-center justify-end">
        <DNAParticleSystem className="scale-125" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-30 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-8"
          >
            <span className="px-4 py-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#9F7AEA] text-[10px] font-semibold tracking-widest uppercase">
              AI Nutrition Intelligence
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-6xl md:text-[5.5rem] font-sans font-bold tracking-tight text-white mb-6 leading-[1.05]">
              Understand Every Food <br />
              <span className="font-serif italic text-white/90 font-light">for </span> 
              <span className="font-serif italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-[#9F7AEA]">absolute health.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-lg md:text-xl text-[rgba(255,255,255,0.72)] mb-12 leading-relaxed font-sans font-light max-w-xl"
          >
            Calyros AI combines multimodal vision, nutrition science, ingredient intelligence, and personalized health analysis to transform every nutrition label into actionable insights tailored specifically to your health profile.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col sm:flex-row items-center gap-6 mb-12"
          >
            <button 
              onClick={() => {
                try { localStorage.removeItem('nutrimind_onboarding'); } catch(e) {}
                navigate('/onboarding/age');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-white/90 transition-all rounded-full font-semibold text-sm tracking-wide flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Start Scanning <Scan size={16} />
            </button>
            <a 
              href="#architecture"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/[0.15] text-[rgba(255,255,255,0.72)] hover:text-white hover:border-white/[0.3] transition-colors rounded-full font-medium text-sm tracking-wide flex items-center justify-center gap-3"
            >
              View Architecture <ArrowRight size={16} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-20 p-5 rounded-2xl bg-[#0A0A0A] border border-white/[0.05]"
          >
            <span className="text-[13px] font-medium text-[rgba(255,255,255,0.48)]">
              Already created your health profile?
            </span>
            <button
              onClick={handleSignIn}
              className="px-6 py-2 border border-white/[0.15] text-[rgba(255,255,255,0.8)] hover:text-white hover:bg-white/[0.05] hover:border-white/[0.3] transition-all duration-300 rounded-full font-medium text-sm flex items-center gap-2"
            >
              Sign In <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* --- Bento Custom Illustrations --- */
const IllusScanner = () => (
  <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-[#6D5EF5]/0 to-[#6D5EF5]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <motion.div 
      animate={{ y: [-5, 5, -5] }} 
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="w-32 h-40 border border-white/[0.15] bg-white/[0.02] backdrop-blur-md rounded-lg p-3 flex flex-col gap-2 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="w-full h-2 bg-white/20 rounded-full" />
      <div className="w-3/4 h-2 bg-white/10 rounded-full" />
      <div className="w-full h-[1px] bg-white/10 my-1" />
      <div className="w-1/2 h-2 bg-white/10 rounded-full" />
      <div className="w-5/6 h-2 bg-white/10 rounded-full" />
      
      {/* Scanning Beam */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-[#8B5CF6] shadow-[0_0_15px_#8B5CF6] z-10"
      />
    </motion.div>
  </div>
);

const IllusIngredients = () => (
  <div className="relative w-full h-48 flex items-center justify-center perspective-[1000px]">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ y: [-i * 5, -i * 5 - 10, -i * 5] }}
        transition={{ duration: 3, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-40 h-24 border border-white/[0.1] rounded-xl bg-[#080808]/80 backdrop-blur-md flex items-center justify-center"
        style={{ 
          transform: `rotateX(60deg) rotateZ(-45deg) translateZ(${i * 20}px)`,
          borderColor: i === 2 ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'
        }}
      >
        {i === 2 && <div className="w-8 h-8 rounded-full border-[2px] border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)]" />}
      </motion.div>
    ))}
  </div>
);

const IllusHealthProfile = () => (
  <div className="relative w-full h-48 flex items-center justify-center">
    <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center z-10">
      <div className="w-6 h-6 rounded-full bg-white/20" />
      <div className="absolute top-10 w-8 h-8 bg-white/20 rounded-t-full" />
    </div>
    
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute w-32 h-32 border border-white/[0.05] rounded-full"
    >
      <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#8B5CF6] rounded-full shadow-[0_0_10px_#8B5CF6] transform -translate-x-1/2 -translate-y-1/2" />
    </motion.div>
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute w-40 h-40 border border-white/[0.05] rounded-full"
    >
      <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white/40 rounded-full transform -translate-x-1/2 translate-y-1/2" />
    </motion.div>
  </div>
);

const IllusScoring = () => (
  <div className="relative w-full h-48 flex items-center justify-center">
    <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <motion.circle 
        cx="60" cy="60" r="50" fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
        strokeDasharray="314"
        initial={{ strokeDashoffset: 314 }}
        whileInView={{ strokeDashoffset: 314 - (314 * 0.98) }}
        transition={{ duration: 2, ease: "easeOut" }}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D5EF5" />
        </linearGradient>
      </defs>
    </svg>
    <div className="absolute flex flex-col items-center">
      <span className="text-2xl font-light text-white">98</span>
      <span className="text-[8px] tracking-widest text-white/50 uppercase">Score</span>
    </div>
  </div>
);

const IllusChat = () => (
  <div className="relative w-full h-48 flex flex-col justify-center gap-4 px-6">
    <motion.div 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="self-end bg-white/[0.05] border border-white/[0.1] rounded-2xl rounded-tr-none px-4 py-2 text-xs text-white/80 max-w-[80%]"
    >
      Can I eat this daily?
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
      className="self-start bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-white/90 max-w-[90%] shadow-[0_0_20px_rgba(139,92,246,0.1)]"
    >
      Based on your profile, it's high in added sugar. I'd recommend a whole-food alternative.
    </motion.div>
  </div>
);

const IllusAlternatives = () => (
  <div className="relative w-full h-48 flex items-center justify-center gap-4">
    <div className="w-20 h-24 border border-white/[0.1] bg-white/[0.02] rounded-lg flex items-center justify-center">
      <div className="w-8 h-8 rounded bg-white/10" />
    </div>
    <motion.div 
      animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}
      className="text-white/30"
    >
      <ArrowRight size={16} />
    </motion.div>
    <div className="w-24 h-28 border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 rounded-lg flex flex-col items-center justify-center relative shadow-[0_0_30px_rgba(139,92,246,0.15)]">
      <div className="absolute -top-2 px-2 py-0.5 bg-[#8B5CF6] text-white text-[8px] font-bold uppercase rounded-full tracking-widest">Optimal</div>
      <div className="w-10 h-10 rounded-full bg-white/20 mb-2" />
      <div className="w-12 h-1.5 bg-white/30 rounded-full" />
    </div>
  </div>
);

const IllusAnalytics = () => (
  <div className="relative w-full h-48 flex items-end justify-center px-8 pb-8">
    <div className="absolute inset-0 bg-gradient-to-t from-[#8B5CF6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
      <motion.path 
        d="M0,80 C40,40 60,60 100,20 C140,-20 160,40 200,10 L200,80 Z"
        fill="url(#graphGrad)"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      />
      <motion.path 
        d="M0,80 C40,40 60,60 100,20 C140,-20 160,40 200,10"
        fill="none" stroke="#8B5CF6" strokeWidth="2"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="graphGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const IllusVault = () => (
  <div className="relative w-full h-48 flex items-center justify-center">
    <motion.div 
      animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="w-20 h-24 border border-white/[0.15] bg-gradient-to-b from-white/[0.05] to-transparent rounded-xl backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)]"
    >
      <div className="w-6 h-6 rounded-full border-2 border-[#8B5CF6] flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
      </div>
    </motion.div>
  </div>
);

const IllusIntegrations = () => (
  <div className="relative w-full h-48 flex items-center justify-center gap-6 px-10">
    {['Vision AI', 'OCR', 'Intelligence'].map((lbl, i) => (
      <React.Fragment key={i}>
        <div className="w-24 h-12 border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 rounded-lg flex items-center justify-center text-[9px] text-[#8B5CF6] uppercase tracking-widest font-semibold shadow-[0_0_15px_rgba(139,92,246,0.1)]">
          {lbl}
        </div>
        {i < 2 && (
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#8B5CF6]/50 to-[#8B5CF6]/10 relative">
            <motion.div 
              animate={{ x: ['0%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-[#8B5CF6] shadow-[0_0_5px_#8B5CF6] rounded-full"
            />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

const BentoCard = ({ title, desc, Illustration, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97, y: 15 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    <GlassCard className="h-full flex flex-col">
      <Illustration />
      <div className="p-8 pt-0 flex-1 flex flex-col justify-end">
        <h3 className="text-lg font-medium text-white mb-2 tracking-wide">{title}</h3>
        <p className="text-[rgba(255,255,255,0.48)] text-sm leading-relaxed font-light">{desc}</p>
      </div>
    </GlassCard>
  </motion.div>
);

const PlatformOverview = () => {
  return (
    <section id="platform" className="py-32 bg-[#050505] relative z-20">
      <div className="absolute inset-0 bg-grain pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-24 flex flex-col items-center text-center">
          <span className="px-3 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.02] text-[rgba(255,255,255,0.48)] text-[9px] font-semibold tracking-[0.2em] uppercase mb-8">
            AI Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-white leading-tight">
            Built for Nutrition Intelligence. <br/>
            <span className="font-serif italic font-medium text-[#9F7AEA]">Designed for You.</span>
          </h2>
        </div>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          <BentoCard 
            title="AI Nutrition Scanner" 
            desc="Scan any nutrition label using our multimodal AI for instant nutrient extraction." 
            Illustration={IllusScanner} 
            className="md:col-span-1 md:row-span-2" 
          />
          <BentoCard 
            title="Ingredient Intelligence" 
            desc="Detect additives, preservatives, allergens, artificial ingredients, and processing level." 
            Illustration={IllusIngredients} 
            className="md:col-span-2" 
          />
          <BentoCard 
            title="Personalized Health Profile" 
            desc="Recommendations adapt to age, allergies, medical conditions, and fitness goals." 
            Illustration={IllusHealthProfile} 
          />
          <BentoCard 
            title="Nutrition Scoring Engine" 
            desc="Scientific AI health scoring based on nutrient balance and user profile." 
            Illustration={IllusScoring} 
          />
          <BentoCard 
            title="AI Nutrition Chat" 
            desc="Ask follow-up nutrition questions naturally. Powered by advanced reasoning." 
            Illustration={IllusChat} 
            className="md:col-span-1 md:row-span-2" 
          />
          <BentoCard 
            title="Healthy Alternatives" 
            desc="Algorithmically suggests healthier products and whole-food replacements." 
            Illustration={IllusAlternatives} 
            className="md:col-span-2" 
          />
          <BentoCard 
            title="Progress Analytics" 
            desc="Track nutrition trends, scan history, health improvements, and dietary habits." 
            Illustration={IllusAnalytics} 
            className="md:col-span-2" 
          />
          <BentoCard 
            title="Secure & Private" 
            desc="Enterprise-grade encryption with complete user privacy." 
            Illustration={IllusVault} 
          />
          <BentoCard 
            title="AI Integrations" 
            desc="Seamlessly connected nodes processing your data in milliseconds." 
            Illustration={IllusIntegrations} 
            className="md:col-span-3" 
          />
        </div>

      </div>
    </section>
  );
};

const ArchitectureTimeline = () => {
  const nodes = [
    'Image Upload',
    'Vision Language Model',
    'OCR',
    'Nutrition Extraction',
    'Ingredient Intelligence Engine',
    'Personal Health Profile',
    'Nutrition Scoring Engine',
    'Recommendation Engine',
    'AI Nutrition Chat',
    'Personalized Insights'
  ];

  return (
    <section id="architecture" className="py-32 bg-[#080808] relative">
      <div className="absolute inset-0 bg-grain pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none z-0" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-sm font-semibold tracking-[0.3em] uppercase text-[#666666] mb-20">Architecture Preview</h2>
        
        <div className="flex flex-col items-center">
          {nodes.map((label, i) => (
            <React.Fragment key={i}>
              <motion.div 
                initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className={`w-full max-w-md p-6 border border-white/[0.08] rounded-2xl backdrop-blur-xl flex items-center justify-center shadow-lg transition-colors hover:border-white/[0.2] ${
                  i === 0 || i === nodes.length - 1 ? 'bg-white/[0.05]' : 'bg-[#0A0A0A]'
                }`}
              >
                <span className={`text-[15px] tracking-wide ${i === 0 || i === nodes.length - 1 ? 'font-semibold text-white' : 'font-medium text-[rgba(255,255,255,0.72)]'}`}>
                  {label}
                </span>
              </motion.div>
              {i < nodes.length - 1 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{ height: 40, opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-[1px] bg-gradient-to-b from-[#6D5EF5]/50 to-transparent my-1 origin-top"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

const LandingFooter = () => (
  <footer className="py-16 bg-[#050505] relative border-t border-white/[0.05]">
    <div className="absolute inset-0 bg-grain pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-3">
        <Scan size={14} className="text-white" />
        <span className="font-medium text-[11px] tracking-[0.2em] uppercase text-white">Calyros AI</span>
      </div>
      <div className="text-[10px] tracking-widest uppercase text-[rgba(255,255,255,0.48)]">
        © {new Date().getFullYear()} Calyros AI. Built with absolute precision.
      </div>
    </div>
  </footer>
);

const AnimatedCounter = ({ from, to, suffix, decimals = 0 }) => {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const node = nodeRef.current;
    
    const controls = animate(from, to, {
      duration: 2,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = value.toFixed(decimals) + suffix;
      },
    });

    return () => controls.stop();
  }, [from, to, suffix, decimals, isInView]);

  return <span ref={nodeRef} className="font-sans font-medium text-white">{from}{suffix}</span>;
};

const StatisticsStrip = () => {
  return (
    <section className="py-24 bg-[#050505] relative border-t border-white/[0.05]">
      <div className="absolute inset-0 bg-grain pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {[
          { label: 'Nutrition Labels Analyzed', to: 1, suffix: 'M+', decimals: 0 },
          { label: 'Extraction Accuracy', to: 98.7, suffix: '%', decimals: 1 },
          { label: 'Health Profiles', to: 50, suffix: 'K+', decimals: 0 },
          { label: 'Insights Generated', to: 10, suffix: 'M+', decimals: 0 }
        ].map((stat, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-center text-center w-full py-6 md:py-0">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-4xl md:text-5xl font-light text-white mb-3"
            >
              <AnimatedCounter from={0} to={stat.to} suffix={stat.suffix} decimals={stat.decimals} />
            </motion.div>
            <span className="text-[11px] tracking-[0.15em] uppercase text-[rgba(255,255,255,0.48)] font-semibold">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function LandingPage() {
  return (
    <div className="bg-[#050505] min-h-screen font-sans selection:bg-[#8B5CF6]/30 selection:text-white overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <PlatformOverview />
      <StatisticsStrip />
      <ArchitectureTimeline />
      <LandingFooter />
    </div>
  );
}
