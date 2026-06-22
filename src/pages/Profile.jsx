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
    <main className="dash-main pt-24 min-h-screen">
      <motion.header
        className="mb-8 flex justify-between items-end"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="dash-welcome-title">Your Health Profile</h1>
          <p className="dash-welcome-sub">Manage your biological metrics and health goals.</p>
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
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        )}
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard hoverable={false} className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              <SkeletonLoader width="100%" height={50} />
              <SkeletonLoader width="100%" height={50} />
              <SkeletonLoader width="100%" height={50} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Age</label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  ) : (
                    <div className="text-xl text-white font-medium">{formData.age || '--'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Height (cm)</label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
                    />
                  ) : (
                    <div className="text-xl text-white font-medium">{formData.height_cm ? `${formData.height_cm} cm` : '--'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                    />
                  ) : (
                    <div className="text-xl text-white font-medium">{formData.weight_kg ? `${formData.weight_kg} kg` : '--'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Activity Level</label>
                  {isEditing ? (
                    <select 
                      className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      value={formData.activity_level}
                      onChange={(e) => setFormData({...formData, activity_level: e.target.value})}
                    >
                      <option value="SEDENTARY">Sedentary</option>
                      <option value="LIGHT">Light</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="ACTIVE">Active</option>
                      <option value="VERY_ACTIVE">Very Active</option>
                    </select>
                  ) : (
                    <div className="text-xl text-white font-medium capitalize">{formData.activity_level.toLowerCase().replace('_', ' ')}</div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Health Goal</label>
                  {isEditing ? (
                    <select 
                      className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      value={formData.health_goal}
                      onChange={(e) => setFormData({...formData, health_goal: e.target.value})}
                    >
                      <option value="lose-weight">Lose Weight</option>
                      <option value="maintain-weight">Maintain Weight</option>
                      <option value="build-muscle">Build Muscle</option>
                      <option value="improve-health">Improve Health</option>
                    </select>
                  ) : (
                    <div className="text-xl text-white font-medium capitalize">{formData.health_goal.replace('-', ' ')}</div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Diet Type</label>
                  {isEditing ? (
                    <select 
                      className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      value={formData.diet_type}
                      onChange={(e) => setFormData({...formData, diet_type: e.target.value})}
                    >
                      <option value="NONE">No specific diet</option>
                      <option value="vegan">Vegan</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="keto">Keto</option>
                      <option value="halal">Halal</option>
                    </select>
                  ) : (
                    <div className="text-xl text-white font-medium capitalize">{formData.diet_type === 'NONE' ? 'No specific diet' : formData.diet_type}</div>
                  )}
                </div>

                {!isEditing && profileObj && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-400 mb-2">Allergies</label>
                      <div className="flex flex-wrap gap-2">
                        {profileObj.allergies ? Object.entries(profileObj.allergies)
                          .filter(([k, v]) => v === true)
                          .map(([k]) => <span key={k} className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider">{k}</span>)
                          : <span className="text-gray-500 text-sm">None reported</span>}
                        {profileObj.allergies && Object.entries(profileObj.allergies).filter(([k, v]) => v === true).length === 0 && <span className="text-gray-500 text-sm">None reported</span>}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-400 mb-2">Medical Conditions</label>
                      <div className="flex flex-wrap gap-2">
                        {profileObj.health_conditions ? Object.entries(profileObj.health_conditions)
                          .filter(([k, v]) => v === true)
                          .map(([k]) => <span key={k} className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider">{k.replace('_', ' ')}</span>)
                          : <span className="text-gray-500 text-sm">None reported</span>}
                        {profileObj.health_conditions && Object.entries(profileObj.health_conditions).filter(([k, v]) => v === true).length === 0 && <span className="text-gray-500 text-sm">None reported</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isEditing && (
                <div className="pt-6 border-t border-white/10 mt-6 flex justify-end">
                  <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </main>
  );
}
