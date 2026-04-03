'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './EditProfileModal.module.css';

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
        'Your profile edit request has been submitted successfully! It will be reviewed by the HR admin.'
      );
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (err) {
      setError(err?.message || 'Failed to submit request. Please try again.');
      console.error('Error submitting profile edit request:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Profile</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            type="button"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              name="employee_name"
              value={formData.employee_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={styles.input}
            />
          </div>

          {/* Contact */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Contact Number</label>
            <input
              type="tel"
              name="contact_no"
              value={formData.contact_no}
              onChange={handleChange}
              placeholder="Enter your contact number"
              className={styles.input}
            />
          </div>

          {/* Designation */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Enter your designation"
              className={styles.input}
            />
          </div>

          {/* Department */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter your department"
              className={styles.input}
            />
          </div>

          {/* Working Location (VEGA) */}
          {(user?.company || '').toLowerCase().includes('vega') && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Working Location</label>
              <input
                type="text"
                name="working_location"
                value={formData.working_location}
                onChange={handleChange}
                placeholder="Enter your working location"
                className={styles.input}
              />
            </div>
          )}

          {/* Branch (AIA) */}
          {(user?.company || '').toLowerCase().includes('aia') && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Enter your branch"
                className={styles.input}
              />
            </div>
          )}

          {/* Date of Birth */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.divider} />

          {/* Error Message */}
          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className={styles.successBox}>
              {successMessage}
            </div>
          )}

          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
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

export default EditProfileModal;
