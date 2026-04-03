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
import { Building2, Camera, Edit2, Hash } from 'lucide-react';

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
    employee_name: user?.employee_name || user?.username || user?.name || '',
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
        }
      } catch {
        // Keep local user as fallback when profile fetch fails.
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

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

    const updatedFullName = (formData.employee_name || '').trim();
    if (updatedFullName !== (user.employee_name || user.username || user.name || '').trim()) {
      changes.employee_name = updatedFullName;
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
    } catch (err) {
      setErrorMessage(err?.error?.message || err?.message || 'Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My Profile"
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'Profile' },
        ]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
      />

      <PageContainer className="px-xl py-lg pb-xl">
        <div className="mx-auto max-w-6xl space-y-4">
          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
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
                  <p className="text-xl font-semibold text-gray-900">{formData.employee_name || '—'}</p>
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
                    className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary p-4 text-white transition-colors hover:bg-primary/90"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Field
                label="Full Name"
                name="employee_name"
                value={formData.employee_name}
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
        </div>
      </PageContainer>
    </>
  );
}
