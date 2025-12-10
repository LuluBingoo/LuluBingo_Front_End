import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import './Profile.css';

export const Profile: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: 'Surafel Worabe',
    email: 'surafel@dallol.et',
    phone: '+251 911 234567',
    location: 'Addis Ababa, Ethiopia'
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert(`Profile updated successfully!\n\nName: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nLocation: ${formData.location}`);
  };

  return (
    <div className="profile-page">
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>{t('profile.title')}</h1>
      </motion.div>

      <div className="profile-content">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="profile-card">
            <div className="profile-avatar-section">
              <motion.div
                className="avatar-circle"
                whileHover={{ scale: 1.05 }}
              >
                <User className="avatar-icon" />
              </motion.div>
              <h2>surafel-worabe</h2>
              <p className="user-role">Portal Manager</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="profile-details"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="details-card">
            <h3>{t('profile.personalInfo')}</h3>
            <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-field">
                <label>
                  <User className="field-icon" />
                  {t('profile.fullName')}
                </label>
                <Input 
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  <Mail className="field-icon" />
                  {t('profile.email')}
                </label>
                <Input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  <Phone className="field-icon" />
                  {t('profile.phone')}
                </label>
                <Input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  <MapPin className="field-icon" />
                  Location
                </label>
                <Input 
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  <Calendar className="field-icon" />
                  Member Since
                </label>
                <Input defaultValue="January 2024" disabled />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="save-button">
                  {t('common.save')} Changes
                </Button>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};