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
    primary_goal: 'MAINTAIN',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profileObj?.profile && !isEditing) {
      setFormData({
        age: profileObj.profile.age || '',
        height_cm: profileObj.profile.height_cm || '',
        weight_kg: profileObj.profile.weight_kg || '',
        activity_level: profileObj.profile.activity_level || 'SEDENTARY',
        primary_goal: profileObj.profile.primary_goal || 'MAINTAIN',
      });
    }
  }, [profileObj, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        profile: {
          age: parseInt(formData.age),
          height_cm: parseFloat(formData.height_cm),
          weight_kg: parseFloat(formData.weight_kg),
          activity_level: formData.activity_level,
          primary_goal: formData.primary_goal,
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
                // Cancel
                setFormData({
                  age: profileObj?.profile?.age || '',
                  height_cm: profileObj?.profile?.height_cm || '',
                  weight_kg: profileObj?.profile?.weight_kg || '',
                  activity_level: profileObj?.profile?.activity_level || 'SEDENTARY',
                  primary_goal: profileObj?.profile?.primary_goal || 'MAINTAIN',
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
                  <label className="block text-sm text-gray-400 mb-2">Primary Goal</label>
                  {isEditing ? (
                    <select 
                      className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      value={formData.primary_goal}
                      onChange={(e) => setFormData({...formData, primary_goal: e.target.value})}
                    >
                      <option value="LOSE_WEIGHT">Lose Weight</option>
                      <option value="MAINTAIN">Maintain</option>
                      <option value="BUILD_MUSCLE">Build Muscle</option>
                      <option value="IMPROVE_HEALTH">Improve Health</option>
                    </select>
                  ) : (
                    <div className="text-xl text-white font-medium capitalize">{formData.primary_goal.toLowerCase().replace('_', ' ')}</div>
                  )}
                </div>
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
