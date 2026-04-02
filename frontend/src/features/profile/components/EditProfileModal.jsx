'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const EditProfileModal = ({ open, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee_name: '',
    contact_no: '',
    designation: '',
    department: '',
    working_location: '',
    branch: '',
    date_of_birth: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        employee_name: user.employee_name || '',
        contact_no: user.contact_no || '',
        designation: user.designation || '',
        department: user.department || '',
        working_location: user.working_location || '',
        branch: user.branch || '',
        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
      });
    }
    setError('');
    setSuccessMessage('');
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getChangedFields = () => {
    const changes = {};
    Object.keys(formData).forEach((key) => {
      const oldValue = user?.[key] || '';
      const newValue = formData[key] || '';
      if (oldValue !== newValue) {
        changes[key] = newValue;
      }
    });
    return changes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      setError('No changes detected. Please modify at least one field.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const userId = user?.id || user?.documentId;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api'}/profile-edit-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              users_permissions_user: userId,
              requested_changes: changes,
              request_status: 'Pending',
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.error?.message || 'Failed to submit profile edit request'
        );
      }

      setSuccessMessage(
        '✓ Your profile edit request has been submitted successfully! It will be reviewed by the HR admin.'
      );
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to submit request. Please try again.');
      console.error('Error submitting profile edit request:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Edit Profile</h2>
          <button
            onClick={onClose}
            style={closeButtonStyle}
            type="button"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div style={dividerStyle} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Name */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              name="employee_name"
              value={formData.employee_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={inputStyle}
            />
          </div>

          {/* Contact */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Contact Number</label>
            <input
              type="tel"
              name="contact_no"
              value={formData.contact_no}
              onChange={handleChange}
              placeholder="Enter your contact number"
              style={inputStyle}
            />
          </div>

          {/* Designation */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Enter your designation"
              style={inputStyle}
            />
          </div>

          {/* Department */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter your department"
              style={inputStyle}
            />
          </div>

          {/* Working Location (VEGA) */}
          {(user?.company || '').toLowerCase().includes('vega') && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>Working Location</label>
              <input
                type="text"
                name="working_location"
                value={formData.working_location}
                onChange={handleChange}
                placeholder="Enter your working location"
                style={inputStyle}
              />
            </div>
          )}

          {/* Branch (AIA) */}
          {(user?.company || '').toLowerCase().includes('aia') && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Enter your branch"
                style={inputStyle}
              />
            </div>
          )}

          {/* Date of Birth */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={dividerStyle} />

          {/* Error Message */}
          {error && <div style={errorBoxStyle}>{error}</div>}

          {/* Success Message */}
          {successMessage && (
            <div style={successBoxStyle}>{successMessage}</div>
          )}

          {/* Buttons */}
          <div style={buttonGroupStyle}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={submitButtonStyle}
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// Styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  maxWidth: '600px',
  width: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
  padding: '28px',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
};

const titleStyle = {
  fontSize: '22px',
  fontWeight: '600',
  margin: 0,
  color: '#000000',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#666666',
  transition: 'color 0.2s',
};

const dividerStyle = {
  height: '1px',
  backgroundColor: '#e0e0e0',
  margin: '16px 0',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#333333',
};

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid #d0d0d0',
  borderRadius: '6px',
  fontSize: '14px',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
  outline: 'none',
};

const helperTextStyle = {
  fontSize: '12px',
  color: '#999999',
  margin: '4px 0 0 0',
};

const errorBoxStyle = {
  padding: '12px',
  backgroundColor: '#fee',
  border: '1px solid #fcc',
  borderRadius: '6px',
  color: '#c33',
  fontSize: '14px',
  marginTop: '8px',
};

const successBoxStyle = {
  padding: '12px',
  backgroundColor: '#efe',
  border: '1px solid #cfc',
  borderRadius: '6px',
  color: '#3c3',
  fontSize: '14px',
  marginTop: '8px',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '20px',
};

const cancelButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#f0f0f0',
  border: '1px solid #d0d0d0',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const submitButtonStyle = {
  padding: '10px 24px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

export default EditProfileModal;
