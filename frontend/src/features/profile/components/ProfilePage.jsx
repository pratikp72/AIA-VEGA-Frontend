'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import Loader from '@/components/common/Loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentUser, getAvatarPropsForUser } from '@/lib/auth';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import { AlertCircle, Building2, Camera, CheckCircle2, Edit2, Eye, EyeOff, Hash } from 'lucide-react';

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toInputDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getInitialForm(user) {
  return {
    username: user?.username || user?.employee_name || user?.name || '',
    email: user?.email || '',
    contact_no: user?.contact_no || '',
    designation: user?.designation || '',
    date_of_birth: toInputDate(user?.date_of_birth),
    joining_date: toInputDate(user?.joining_date),
  };
}

function getPhotographId(user) {
  const photo = user?.photograph;
  if (!photo) return null;
  if (typeof photo === 'number') return photo;
  if (typeof photo?.id === 'number') return photo.id;
  if (typeof photo?.data?.id === 'number') return photo.data.id;
  return null;
}

function Field({ label, value, editing, name, onChange, type = 'text', disabled = false, selectOptions = [] }) {
  const baseClass =
    'h-11 w-full rounded-xl border border-gray-200 bg-white text-sm p-3 text-gray-text outline-none transition focus:border-primary';

  return (
    <div>
      <p className="mb-2">{label}</p>
      {editing ? (
        selectOptions.length > 0 ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseClass} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}
          >
            {selectOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseClass} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}
          />
        )
      ) : (
        <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-text">
          {value || '—'}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const [uploadedPhotoId, setUploadedPhotoId] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasPendingEditRequest, setHasPendingEditRequest] = useState(false);

  // Password reset state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwShow, setPwShow] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const profileBgStyle = {
    backgroundImage: 'url(/profile-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const loadPendingEditRequestStatus = async (targetUserId) => {
    if (!targetUserId) {
      setHasPendingEditRequest(false);
      return;
    }

    try {
      const response = await api.get(API_ENDPOINTS.PROFILE_EDIT_REQUESTS.LIST, {
        params: {
          'filters[users_permissions_user][id][$eq]': targetUserId,
          'filters[request_status][$eq]': 'Pending',
          'pagination[page]': 1,
          'pagination[pageSize]': 1,
          sort: 'createdAt:desc',
        },
      });

      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      setHasPendingEditRequest(rows.length > 0);
    } catch {
      // Do not block profile UI if pending-state lookup fails.
      setHasPendingEditRequest(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const data = getCurrentUser();
      if (!data) {
        router.replace('/login');
        return;
      }

      if (isMounted) {
        setUser(data);
        setFormData(getInitialForm(data));
      }

      try {
        const me = await api.get(API_ENDPOINTS.AUTH.ME, {
          params: {
            'populate[photograph]': true,
          },
        });

        const freshUser = me?.user || me?.data || me;
        const userId = freshUser?.id ?? data?.id ?? data?.documentId;

        let mergedUser = freshUser;
        if (userId) {
          try {
            const fullUserRes = await api.get(API_ENDPOINTS.USERS.GET(userId), {
              params: {
                'populate[photograph]': true,
              },
            });
            const fullUser = fullUserRes?.data || fullUserRes;
            if (fullUser) mergedUser = { ...freshUser, ...fullUser };
          } catch {
            // Keep auth/me response if users/:id fails.
          }
        }

        if (mergedUser && isMounted) {
          setUser(mergedUser);
          setFormData(getInitialForm(mergedUser));
          setAvatarPreviewUrl('');
          setUploadedPhotoId(null);
          localStorage.setItem('user', JSON.stringify(mergedUser));
          const targetUserId = mergedUser?.id ?? mergedUser?.documentId;
          await loadPendingEditRequestStatus(targetUserId);
        }
      } catch {
        // Keep local user as fallback when profile fetch fails.
        const fallbackUserId = data?.id ?? data?.documentId;
        await loadPendingEditRequestStatus(fallbackUserId);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!user?.id && !user?.documentId) return;

    const handleFocus = () => {
      const targetUserId = user?.id ?? user?.documentId;
      loadPendingEditRequestStatus(targetUserId);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, user?.documentId]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  if (!user || !formData) {
    return (
      <PageContainer className="flex min-h-[50vh] items-center justify-center">
        <Loader size="lg" />
      </PageContainer>
    );
  }

  const { src: avatarSrc, initials } = getAvatarPropsForUser(user);
  const displayAvatarSrc = isEditing && avatarPreviewUrl ? avatarPreviewUrl : avatarSrc;
  const isAIA = String(user?.company || '').toLowerCase().includes('aia');
  const userCode = isAIA ? user?.emp_code : user?.emp_id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    if (hasPendingEditRequest) {
      setErrorMessage('You have already requested profile changes. Please wait for admin review.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setFormData(getInitialForm(user));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setFormData(getInitialForm(user));
    setAvatarPreviewUrl('');
    setUploadedPhotoId(null);
    setIsEditing(false);
  };

  const handleAvatarIconClick = () => {
    if (!isEditing || uploadingPhoto) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setSuccessMessage('');

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be under 5MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(objectUrl);

    try {
      setUploadingPhoto(true);
      const formDataForUpload = new FormData();
      formDataForUpload.append('files', file);

      const uploaded = await api.post('/upload', formDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const mediaId = Array.isArray(uploaded) ? uploaded[0]?.id : uploaded?.id;
      if (!mediaId) {
        throw new Error('Image upload failed. Please try again.');
      }
      setUploadedPhotoId(mediaId);
    } catch (err) {
      setErrorMessage(err?.error?.message || err?.message || 'Failed to upload profile image.');
      setAvatarPreviewUrl('');
      setUploadedPhotoId(null);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const changes = {};

    const updatedFullName = (formData.username || '').trim();
    if (updatedFullName !== (user.username || user.employee_name || user.name || '').trim()) {
      changes.username = updatedFullName;
    }
    if ((formData.contact_no || '').trim() !== (user.contact_no || '').trim()) {
      changes.contact_no = (formData.contact_no || '').trim();
    }
    if ((formData.designation || '').trim() !== (user.designation || '').trim()) {
      changes.designation = (formData.designation || '').trim();
    }
    if ((formData.email || '').trim() !== (user.email || '').trim()) {
      changes.email = (formData.email || '').trim();
    }
    if ((formData.date_of_birth || '') !== toInputDate(user.date_of_birth)) {
      changes.date_of_birth = formData.date_of_birth || null;
    }
    if ((formData.joining_date || '') !== toInputDate(user.joining_date)) {
      changes.joining_date = formData.joining_date || null;
    }
    const currentPhotographId = getPhotographId(user);
    if (uploadedPhotoId && uploadedPhotoId !== currentPhotographId) {
      changes.photograph = uploadedPhotoId;
    }

    if (Object.keys(changes).length === 0) {
      setErrorMessage('No changes detected.');
      return;
    }

    const userId = user?.id || user?.documentId;
    if (!userId) {
      setErrorMessage('User ID not found.');
      return;
    }

    try {
      setSaving(true);

      await api.post(API_ENDPOINTS.PROFILE_EDIT_REQUESTS.CREATE, {
        data: {
          users_permissions_user: userId,
          requested_changes: changes,
          request_status: 'Pending',
        },
      });

      setIsEditing(false);
      // Keep UI on approved profile values until admin approves the request.
      setFormData(getInitialForm(user));
      setAvatarPreviewUrl('');
      setUploadedPhotoId(null);
      setSuccessMessage('Profile update request sent to admin for approval.');
      setHasPendingEditRequest(true);
    } catch (err) {
      setErrorMessage(err?.error?.message || err?.message || 'Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePwShow = (field) => {
    setPwShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePwSubmit = async () => {
    setPwError('');
    setPwSuccess('');

    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirm password do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setPwError('New password must be different from your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }

    try {
      setPwSaving(true);
      await api.post('/auth/update-password', { currentPassword, newPassword, confirmPassword });

      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwSuccess('Password updated successfully.');
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err) {
      const msg = err?.error?.message || err?.message || 'Failed to update password.';
      setPwError(msg);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={profileBgStyle}>
      <PageHeader
        title="My Profile"
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'Profile' },
        ]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
      />

      <PageContainer className="px-xl pb-xl">
        <div className="mx-auto space-y-4">
          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {hasPendingEditRequest && !isEditing && (
            <div className="rounded-xl border border-primary-opacity-20 bg-primary-light px-4 py-3 text-sm text-primary">
              You have requested profile changes. Your request has been submitted to the admin for approval.
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-18 w-18 border border-gray-300">
                    <AvatarImage src={displayAvatarSrc} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleAvatarIconClick}
                      disabled={uploadingPhoto}
                      className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                      title="Change profile picture"
                      aria-label="Change profile picture"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                </div>

                <div>
                  <p className="text-xl font-semibold text-gray-900">{formData.username || '—'}</p>
                  <div className="mt-1 flex items-center gap-2 text-gray-500">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>{user?.company || '—'}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-gray-500">
                    <Hash className="h-3.5 w-3.5 text-primary" />
                    <span>{userCode || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="rounded-md h-10 border border-primary px-3 py-1.5 text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || uploadingPhoto}
                      className="rounded-md h-10 bg-primary px-3 py-1.5 text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                    >
                      {uploadingPhoto ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={hasPendingEditRequest}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-md p-4 text-white transition-colors ${
                      hasPendingEditRequest
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    {hasPendingEditRequest ? 'Requested' : 'Edit Profile'}
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Field
                label="Full Name"
                name="username"
                value={formData.username}
                editing={isEditing}
                onChange={handleChange}
              />
              <Field
                label="Email"
                name="email"
                value={formData.email}
                editing={isEditing}
                onChange={handleChange}
              />
              <Field
                label="Contact"
                name="contact_no"
                value={formData.contact_no}
                editing={isEditing}
                onChange={handleChange}
              />
              <Field
                label="Designation"
                name="designation"
                value={formData.designation}
                editing={isEditing}
                onChange={handleChange}
              />
              <Field
                label="Date of Birth"
                name="date_of_birth"
                value={isEditing ? formData.date_of_birth : formatDate(formData.date_of_birth)}
                editing={isEditing}
                onChange={handleChange}
                type="date"
              />
              <Field
                label="Joining Date"
                name="joining_date"
                value={isEditing ? formData.joining_date : formatDate(formData.joining_date)}
                editing={isEditing}
                onChange={handleChange}
                type="date"
              />
            </div>

            {errorMessage && (
              <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
            )}
          </section>

          {/* Reset Password */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-8">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Reset Password</h2>

            {pwError && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Password update failed</p>
                  <p className="text-sm text-red-600 mt-0.5">{pwError}</p>
                </div>
              </div>
            )}

            {pwSuccess && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                <p className="text-sm font-medium text-green-700">{pwSuccess}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { field: 'currentPassword', label: 'Current Password' },
                { field: 'newPassword', label: 'New Password' },
                { field: 'confirmPassword', label: 'Confirm Password' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <p className="mb-2 text-sm">{label}</p>
                  <div className="relative">
                    <input
                      type={pwShow[field] ? 'text' : 'password'}
                      name={field}
                      value={pwForm[field]}
                      onChange={handlePwChange}
                      placeholder={label}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white text-sm p-3 pr-10 text-gray-text outline-none transition focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => togglePwShow(field)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {pwShow[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handlePwSubmit}
                disabled={pwSaving}
                className="rounded-md h-10 bg-primary px-6 py-1.5 text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>

          </section>

        </div>
      </PageContainer>
    </div>
  );
}
