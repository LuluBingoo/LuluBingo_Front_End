import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Smartphone, QrCode } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import { shopApi, authApi } from '../services/api';
import { ShopProfile, TwoFactorSetup } from '../services/types';
import { QRCodeSVG } from 'qrcode.react';
import './Profile.css';

export const Profile: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  
  // 2FA State
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [otp, setOtp] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await shopApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ShopProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await shopApi.updateProfile({
        name: profile.name,
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone,
        bank_name: profile.bank_name,
        bank_account_name: profile.bank_account_name,
        bank_account_number: profile.bank_account_number,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile.');
    }
  };

  const startTwoFactorSetup = async () => {
    try {
      const data = await authApi.setup2FA();
      setTwoFactorSetup(data);
      setShowTwoFactorSetup(true);
    } catch (error) {
      console.error('Failed to start 2FA setup', error);
      alert('Failed to start 2FA setup.');
    }
  };

  const enableTwoFactor = async () => {
    try {
      await authApi.enable2FA(otp);
      alert('Two-factor authentication enabled successfully!');
      setShowTwoFactorSetup(false);
      setTwoFactorSetup(null);
      setOtp('');
      loadProfile(); // Refresh profile to update verify status
    } catch (error) {
      console.error('Failed to enable 2FA', error);
      alert('Invalid OTP or server error.');
    }
  };

  const disableTwoFactor = async () => {
    const code = prompt('Enter OTP to disable 2FA:');
    if (!code) return;
    try {
      await authApi.disable2FA(code);
      alert('Two-factor authentication disabled.');
      loadProfile();
    } catch (error) {
      console.error('Failed to disable 2FA', error);
      alert('Failed to disable 2FA. Invalid OTP?');
    }
  };

  if (loading) {
     return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (!profile) {
      return <div className="p-8 text-center text-red-500">Failed to load profile data.</div>;
  }

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
              <h2>{profile.name || profile.username}</h2>
              <p className="user-role">{profile.shop_code}</p>
              
              <div className="mt-6 w-full">
                  <div className="text-sm font-medium mb-2 text-gray-400">Security</div>
                  {profile.two_factor_enabled ? (
                      <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center">
                          <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
                              <Shield size={18} />
                              <span className="font-semibold">2FA Enabled</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={disableTwoFactor} className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                              Disable 2FA
                          </Button>
                      </div>
                  ) : (
                      <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 text-center">
                          <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
                              <Shield size={18} />
                              <span className="font-semibold">2FA Disabled</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={startTwoFactorSetup} className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400">
                              Setup 2FA
                          </Button>
                      </div>
                  )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="profile-details"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          
          {showTwoFactorSetup && twoFactorSetup ? (
              <Card className="details-card mb-6 mb-4 !border-yellow-500/30">
                  <h3 className="text-yellow-500 flex items-center gap-2">
                      <QrCode size={20} />
                      Setup Two-Factor Authentication
                  </h3>
                  <div className="p-4 flex flex-col items-center gap-4">
                      <div className="bg-white p-2 rounded">
                         <QRCodeSVG value={twoFactorSetup.provisioning_uri} size={150} />
                      </div>
                      <p className="text-sm text-gray-400 text-center">
                          Scan this QR code with your Authenticator App (Google Authenticator, Authy, etc.)
                      </p>
                      <div className="w-full max-w-xs">
                          <Input 
                              placeholder="Enter 6-digit code" 
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="text-center text-lg tracking-widest"
                              maxLength={6}
                          />
                      </div>
                      <div className="flex gap-2 w-full max-w-xs">
                          <Button variant="outline" className="flex-1" onClick={() => setShowTwoFactorSetup(false)}>Cancel</Button>
                          <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black" onClick={enableTwoFactor}>Enable</Button>
                      </div>
                  </div>
              </Card>
          ) : null}

          <Card className="details-card">
            <h3>{t('profile.personalInfo')}</h3>
            <form className="profile-form" onSubmit={handleSave}>
              <div className="form-field">
                <label>
                  <User className="field-icon" />
                  {t('profile.fullName')}
                </label>
                <Input 
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  <Mail className="field-icon" />
                  {t('profile.email')}
                </label>
                <Input 
                  type="email" 
                  value={profile.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  <Phone className="field-icon" />
                  {t('profile.phone')}
                </label>
                <Input 
                  type="tel" 
                  value={profile.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  <Calendar className="field-icon" />
                  Member Since
                </label>
                <Input defaultValue={new Date(profile.created_at).toLocaleDateString()} disabled />
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