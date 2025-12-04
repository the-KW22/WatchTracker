import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { User, Mail, Phone, Save, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  created_at: string;
}

export const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Form states
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password reset
  const [resetEmail, setResetEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user metadata from Supabase Auth
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (authUser) {
        setProfile({
          id: authUser.id,
          email: authUser.email!,
          username: authUser.user_metadata?.username || '',
          phone: authUser.user_metadata?.phone || '',
          created_at: authUser.created_at,
        });
        
        setUsername(authUser.user_metadata?.username || '');
        setPhone(authUser.user_metadata?.phone || '');
        setResetEmail(authUser.email || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          username,
          phone,
        },
      });

      if (error) throw error;

      alert('Profile updated successfully!');
      loadProfile();
    } catch (error: any) {
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      alert('Please enter your email address');
      return;
    }

    setSendingReset(true);
    setResetMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setResetMessage(`Error: ${error.message}`);
    } finally {
      setSendingReset(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-12 w-48 bg-white/10" />
        <Skeleton className="h-96 bg-white/10" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="text-gray-300 hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      {/* Profile Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 bg-purple-600">
              <AvatarFallback className="bg-purple-600 text-white text-2xl">
                {getInitials(profile.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {username || 'User Profile'}
              </h1>
              <p className="text-gray-400">{profile.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <Input
              type="email"
              value={profile.email}
              disabled
              className="bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400">Display name for your profile</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400">Optional - for account recovery</p>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Password Reset */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            Password Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">
            Forgot your password? Enter your email to receive a password reset link.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Email Address</label>
            <Input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {resetMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              resetMessage.includes('Error') 
                ? 'bg-red-500/20 border border-red-500/50 text-red-200'
                : 'bg-green-500/20 border border-green-500/50 text-green-200'
            }`}>
              {resetMessage}
            </div>
          )}

          <Button
            onClick={handlePasswordReset}
            disabled={sendingReset || !resetEmail}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            {sendingReset ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Password Reset Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-900/20 backdrop-blur-md border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-300">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">
            Once you sign out, you'll need to log in again to access your watchlist.
          </p>
          <Button
            onClick={signOut}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};