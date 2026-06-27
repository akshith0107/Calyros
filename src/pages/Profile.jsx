import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../hooks/useDashboardData';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import SkeletonLoader from '../components/SkeletonLoader';
import apiClient from '../services/apiClient';
import { useQueryClient } from '@tanstack/react-query';

export default function Profile() {
  const { data: profileObj, isLoading } = useProfile();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    height_cm: '',
    weight_kg: '',
    activity_level: 'SEDENTARY',
    health_goal: 'MAINTAIN',
    diet_type: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profileObj?.profile && !isEditing) {
      setFormData({
        age: profileObj.profile.age || '',
        height_cm: profileObj.profile.height_cm || '',
        weight_kg: profileObj.profile.weight_kg || '',
        activity_level: profileObj.profile.activity_level || 'SEDENTARY',
        health_goal: profileObj.profile.health_goal || 'MAINTAIN',
        diet_type: profileObj.profile.diet_type || 'NONE'
      });
    }
  }, [profileObj, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        profile: {
          age: parseInt(formData.age) || undefined,
          height_cm: parseFloat(formData.height_cm) || undefined,
          weight_kg: parseFloat(formData.weight_kg) || undefined,
          activity_level: formData.activity_level,
          health_goal: formData.health_goal,
          diet_type: formData.diet_type !== 'NONE' ? formData.diet_type : null
        }
      };
      
      const { data } = await apiClient.put('/profile/me', payload);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-16 space-y-8">
      <motion.div 
        className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Your Health Profile</h1>
          <p className="text-[rgba(255,255,255,0.48)] text-sm font-medium">Manage your biological metrics and health goals.</p>
        </div>
        {!isLoading && (
          <Button 
            variant={isEditing ? 'secondary' : 'primary'} 
            onClick={() => {
              if (isEditing) {
                setFormData({
                  age: profileObj?.profile?.age || '',
                  height_cm: profileObj?.profile?.height_cm || '',
                  weight_kg: profileObj?.profile?.weight_kg || '',
                  activity_level: profileObj?.profile?.activity_level || 'SEDENTARY',
                  health_goal: profileObj?.profile?.health_goal || 'MAINTAIN',
                  diet_type: profileObj?.profile?.diet_type || 'NONE'
                });
              }
              setIsEditing(!isEditing);
            }}
            className={isEditing ? "px-6 rounded-full" : "px-6 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]"}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </Button>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard hoverable={false} className="p-8 md:p-10 border-white/[0.05] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFFFFF] opacity-[0.03] blur-[80px] rounded-full pointer-events-none"></div>

          {isLoading ? (
            <div className="space-y-6">
              <SkeletonLoader width="100%" height={80} className="rounded-xl" />
              <SkeletonLoader width="100%" height={80} className="rounded-xl" />
              <SkeletonLoader width="100%" height={80} className="rounded-xl" />
            </div>
          ) : (
            <div className="space-y-10 relative z-10">
              
              {/* Core Metrics */}
              <div>
                <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider mb-6 pb-2 border-b border-white/[0.05]">Biological Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-white/[0.05]">
                    <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-3">Age</label>
                    {isEditing ? (
                      <input 
                        type="number" 
                        className="w-full bg-[#050505] border border-white/[0.1] rounded-xl p-4 text-white focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] transition-all placeholder-white/20"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        placeholder="e.g. 30"
                      />
                    ) : (
                      <div className="text-3xl text-white font-bold">{formData.age || '--'}</div>
                    )}
                  </div>
                  <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-white/[0.05]">
                    <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-3">Height (cm)</label>
                    {isEditing ? (
                      <input 
                        type="number" 
                        className="w-full bg-[#050505] border border-white/[0.1] rounded-xl p-4 text-white focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] transition-all placeholder-white/20"
                        value={formData.height_cm}
                        onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
                        placeholder="e.g. 175"
                      />
                    ) : (
                      <div className="text-3xl text-white font-bold flex items-baseline gap-1">
                        {formData.height_cm || '--'} <span className="text-sm text-white/40 font-medium">{formData.height_cm ? 'cm' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-white/[0.05]">
                    <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-3">Weight (kg)</label>
                    {isEditing ? (
                      <input 
                        type="number" 
                        className="w-full bg-[#050505] border border-white/[0.1] rounded-xl p-4 text-white focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] transition-all placeholder-white/20"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                        placeholder="e.g. 70"
                      />
                    ) : (
                      <div className="text-3xl text-white font-bold flex items-baseline gap-1">
                        {formData.weight_kg || '--'} <span className="text-sm text-white/40 font-medium">{formData.weight_kg ? 'kg' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lifestyle & Goals */}
              <div>
                <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider mb-6 pb-2 border-b border-white/[0.05]">Lifestyle & Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-white/[0.05]">
                    <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-3">Activity Level</label>
                    {isEditing ? (
                      <div className="relative">
                        <select 
                          className="w-full bg-[#050505] border border-white/[0.1] rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]/30 transition-all cursor-pointer"
                          value={formData.activity_level}
                          onChange={(e) => setFormData({...formData, activity_level: e.target.value})}
                        >
                          <option value="SEDENTARY">Sedentary</option>
                          <option value="LIGHT">Light</option>
                          <option value="MODERATE">Moderate</option>
                          <option value="ACTIVE">Active</option>
                          <option value="VERY_ACTIVE">Very Active</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xl text-white font-bold capitalize">{formData.activity_level.toLowerCase().replace('_', ' ')}</div>
                    )}
                  </div>

                  <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-white/[0.05]">
                    <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-3">Health Goal</label>
                    {isEditing ? (
                      <div className="relative">
                        <select 
                          className="w-full bg-[#050505] border border-white/[0.1] rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]/30 transition-all cursor-pointer"
                          value={formData.health_goal}
                          onChange={(e) => setFormData({...formData, health_goal: e.target.value})}
                        >
                          <option value="lose-weight">Lose Weight</option>
                          <option value="maintain-weight">Maintain Weight</option>
                          <option value="build-muscle">Build Muscle</option>
                          <option value="improve-health">Improve Health</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xl text-white font-bold capitalize">{formData.health_goal.replace('-', ' ')}</div>
                    )}
                  </div>

                  <div className="md:col-span-2 bg-[#0A0A0A] p-5 rounded-2xl border border-white/[0.05]">
                    <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-3">Diet Type</label>
                    {isEditing ? (
                      <div className="relative">
                        <select 
                          className="w-full bg-[#050505] border border-white/[0.1] rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]/30 transition-all cursor-pointer"
                          value={formData.diet_type}
                          onChange={(e) => setFormData({...formData, diet_type: e.target.value})}
                        >
                          <option value="NONE">No specific diet</option>
                          <option value="vegan">Vegan</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="keto">Keto</option>
                          <option value="halal">Halal</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xl text-white font-bold capitalize">{formData.diet_type === 'NONE' ? 'No specific diet' : formData.diet_type}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditions & Allergies */}
              {!isEditing && profileObj && (
                <div>
                  <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider mb-6 pb-2 border-b border-white/[0.05]">Conditions & Allergies (Managed in Onboarding)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-white/[0.05]">
                      <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-4">Allergies</label>
                      <div className="flex flex-wrap gap-2">
                        {profileObj.allergies && Object.values(profileObj.allergies).some(v => v === true) ? (
                          Object.entries(profileObj.allergies)
                            .filter(([k, v]) => v === true)
                            .map(([k]) => (
                              <span key={k} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest shadow-sm">
                                {k}
                              </span>
                            ))
                        ) : (
                          <span className="text-white/30 text-sm italic">None reported</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-white/[0.05]">
                      <label className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-4">Medical Conditions</label>
                      <div className="flex flex-wrap gap-2">
                        {profileObj.health_conditions && Object.values(profileObj.health_conditions).some(v => v === true) ? (
                          Object.entries(profileObj.health_conditions)
                            .filter(([k, v]) => v === true)
                            .map(([k]) => (
                              <span key={k} className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest shadow-sm">
                                {k.replace(/_/g, ' ')}
                              </span>
                            ))
                        ) : (
                          <span className="text-white/30 text-sm italic">None reported</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="pt-8 border-t border-white/[0.05] flex justify-end">
                  <Button variant="primary" onClick={handleSave} disabled={isSaving} className="px-10 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
