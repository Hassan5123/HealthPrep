'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../utils/api';
import Navbar from '../../components/Navbar';

// Type definitions for user profile data
interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string | null;
  existing_conditions: string | null;
}

export default function UserProfilePage() {
  const router = useRouter();
  
  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  
  // Track which fields are in edit mode
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({
    email: false,
    first_name: false,
    last_name: false,
    date_of_birth: false,
    phone: false,
    existing_conditions: false,
  });
  
  // Track edited values (temporary values while editing)
  const [editedValues, setEditedValues] = useState<Partial<UserProfile>>({});
  
  // Track temporary field values while editing (before confirming with checkmark)
  const [tempFieldValues, setTempFieldValues] = useState<Partial<UserProfile>>({});

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  /**
   * Fetches the user profile from the backend
   * @param showLoadingSpinner - Whether to show the loading spinner (default: true, false when refreshing after save)
   */
  const fetchProfile = async (showLoadingSpinner: boolean = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const data = await apiRequest<UserProfile>('/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setProfile(data);
      setEditedValues(data);
      setTempFieldValues(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      if (err.statusCode === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('authToken');
        router.push('/login');
      }
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  };

  /**
   * Starts editing mode for a field and stores current value in temp
   */
  const startEditing = (field: keyof UserProfile) => {
    setEditingFields(prev => ({
      ...prev,
      [field]: true,
    }));
    // Store current value as temp
    setTempFieldValues(prev => ({
      ...prev,
      [field]: editedValues[field],
    }));
  };

  /**
   * Confirms the edit (checkmark clicked) - saves temp value to edited values
   */
  const confirmEdit = (field: keyof UserProfile) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: tempFieldValues[field],
    }));
    setEditingFields(prev => ({
      ...prev,
      [field]: false,
    }));
  };

  /**
   * Cancels the edit (X clicked) - reverts to original edited value
   */
  const cancelEdit = (field: keyof UserProfile) => {
    setTempFieldValues(prev => ({
      ...prev,
      [field]: editedValues[field],
    }));
    setEditingFields(prev => ({
      ...prev,
      [field]: false,
    }));
  };

  /**
   * Handles input changes for temp field values (while editing)
   */
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setTempFieldValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Saves the updated profile to the backend
   */
  const handleSave = async () => {
    try {
      setError(null);
      setSaveMessage(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Prepare the data to send - ensure all required fields are present
      const dataToSend: any = {
        email: editedValues.email,
        first_name: editedValues.first_name,
        last_name: editedValues.last_name,
        date_of_birth: editedValues.date_of_birth,
        phone: editedValues.phone || null,
        existing_conditions: editedValues.existing_conditions || null,
      };

      const response = await apiRequest('/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      setSaveMessage('Profile updated successfully!');
      
      // Reset all editing fields
      setEditingFields({
        email: false,
        first_name: false,
        last_name: false,
        date_of_birth: false,
        phone: false,
        existing_conditions: false,
      });
      
      // Refresh profile data from server (without loading spinner)
      await fetchProfile(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  /**
   * Handles account deactivation
   */
  const handleDeactivate = async () => {
    try {
      setIsDeactivating(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      await apiRequest('/users/deactivate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Show deactivation message
      setSaveMessage('Account deactivated successfully. Logging out...');
      
      // Wait 2 seconds before logging out
      setTimeout(() => {
        localStorage.removeItem('authToken');
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate account');
      setIsDeactivating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state (for non-auth errors)
  if (!profile && error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => fetchProfile()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">My Profile</h1>
            <p className="text-slate-600">View and manage your account information</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {saveMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm">{saveMessage}</p>
            </div>
          )}

          {/* Profile Fields */}
          <div className="space-y-4">
            {/* Email Field */}
            <ProfileField
              label="Email"
              field="email"
              value={tempFieldValues.email || ''}
              displayValue={editedValues.email || ''}
              isEditing={editingFields.email}
              onStartEdit={startEditing}
              onConfirmEdit={confirmEdit}
              onCancelEdit={cancelEdit}
              onValueChange={handleInputChange}
              type="email"
            />

            {/* First Name Field */}
            <ProfileField
              label="First Name"
              field="first_name"
              value={tempFieldValues.first_name || ''}
              displayValue={editedValues.first_name || ''}
              isEditing={editingFields.first_name}
              onStartEdit={startEditing}
              onConfirmEdit={confirmEdit}
              onCancelEdit={cancelEdit}
              onValueChange={handleInputChange}
            />

            {/* Last Name Field */}
            <ProfileField
              label="Last Name"
              field="last_name"
              value={tempFieldValues.last_name || ''}
              displayValue={editedValues.last_name || ''}
              isEditing={editingFields.last_name}
              onStartEdit={startEditing}
              onConfirmEdit={confirmEdit}
              onCancelEdit={cancelEdit}
              onValueChange={handleInputChange}
            />

            {/* Date of Birth Field */}
            <ProfileField
              label="Date of Birth"
              field="date_of_birth"
              value={tempFieldValues.date_of_birth || ''}
              displayValue={editedValues.date_of_birth || ''}
              isEditing={editingFields.date_of_birth}
              onStartEdit={startEditing}
              onConfirmEdit={confirmEdit}
              onCancelEdit={cancelEdit}
              onValueChange={handleInputChange}
              type="date"
            />

            {/* Phone Field */}
            <ProfileField
              label="Phone"
              field="phone"
              value={tempFieldValues.phone || ''}
              displayValue={editedValues.phone || ''}
              isEditing={editingFields.phone}
              onStartEdit={startEditing}
              onConfirmEdit={confirmEdit}
              onCancelEdit={cancelEdit}
              onValueChange={handleInputChange}
              type="tel"
            />

            {/* Existing Conditions Field */}
            <ProfileField
              label="Existing Conditions"
              field="existing_conditions"
              value={tempFieldValues.existing_conditions || ''}
              displayValue={editedValues.existing_conditions || ''}
              isEditing={editingFields.existing_conditions}
              onStartEdit={startEditing}
              onConfirmEdit={confirmEdit}
              onCancelEdit={cancelEdit}
              onValueChange={handleInputChange}
              multiline
            />
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Deactivate Account Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Danger Zone</h2>
          
          {!showDeactivateConfirm ? (
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={isDeactivating}
            >
              Deactivate Account
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">Are you sure you want to deactivate your account?</p>
                <p className="text-red-700 text-sm">
                  This will deactivate your account and you will be logged out immediately. Your health data will be preserved but you won't be able to access it until you contact support to reactivate your account.
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleDeactivate}
                  disabled={isDeactivating}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeactivating ? 'Deactivating...' : 'Yes, Deactivate'}
                </button>
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  disabled={isDeactivating}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 px-6 rounded-lg font-medium hover:bg-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}

/**
 * Reusable component for profile fields with edit functionality
 */
interface ProfileFieldProps {
  label: string;
  field: keyof UserProfile;
  value: string;
  displayValue: string;
  isEditing: boolean;
  onStartEdit: (field: keyof UserProfile) => void;
  onConfirmEdit: (field: keyof UserProfile) => void;
  onCancelEdit: (field: keyof UserProfile) => void;
  onValueChange: (field: keyof UserProfile, value: string) => void;
  type?: string;
  multiline?: boolean;
}

function ProfileField({
  label,
  field,
  value,
  displayValue,
  isEditing,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  onValueChange,
  type = 'text',
  multiline = false,
}: ProfileFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
        {isEditing ? (
          multiline ? (
            <textarea
              value={value}
              onChange={(e) => onValueChange(field, e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
              rows={3}
            />
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => onValueChange(field, e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
            />
          )
        ) : (
          <div className="px-4 py-2 bg-slate-50 rounded-lg text-slate-800 min-h-[42px] flex items-center">
            {displayValue || <span className="text-slate-400">Not provided</span>}
          </div>
        )}
      </div>
      
      {/* Edit/Confirm/Cancel Icon Buttons */}
      <div className="flex gap-1 mt-7">
        {isEditing ? (
          <>
            {/* Confirm (Check) icon */}
            <button
              onClick={() => onConfirmEdit(field)}
              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
              aria-label="Confirm edit"
            >
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            {/* Cancel (X) icon */}
            <button
              onClick={() => onCancelEdit(field)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Cancel edit"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          // Pencil icon when not editing
          <button
            onClick={() => onStartEdit(field)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Edit field"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}