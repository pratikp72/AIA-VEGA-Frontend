
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import Loader from '@/components/common/Loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentUser, getAvatarPropsForUser } from '@/lib/auth';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';

import {
  User,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  Hash,
  IdCard,
} from 'lucide-react';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 items-start">
      <Icon className="w-4 h-4 text-primary mt-1" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-gray-dark">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const data = getCurrentUser();

      if (!data) {
        router.replace('/login');
        return;
      }

      if (isMounted) setUser(data);

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
          const avatarFromMerged = getAvatarPropsForUser(mergedUser);
          if (!avatarFromMerged.src) {
            try {
              const searchKey = mergedUser?.email || mergedUser?.emp_id || mergedUser?.emp_code || mergedUser?.username || '';
              if (searchKey) {
                const analytics = await api.get(API_ENDPOINTS.ANALYTICS.EMPLOYEES, {
                  params: { search: searchKey, page: 1, pageSize: 25 },
                });
                const items = Array.isArray(analytics?.items) ? analytics.items : [];
                const matched = items.find((emp) =>
                  (mergedUser?.id && emp?.id === mergedUser.id) ||
                  (mergedUser?.email && emp?.email === mergedUser.email) ||
                  (mergedUser?.emp_id && emp?.emp_id === mergedUser.emp_id) ||
                  (mergedUser?.emp_code && emp?.emp_code === mergedUser.emp_code)
                ) || items[0];
                if (matched) mergedUser = { ...mergedUser, ...matched };
              }
            } catch {
              // Keep merged user if analytics fallback fails.
            }
          }

          setUser(mergedUser);
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

  if (!user) {
    return (
      <PageContainer className="flex justify-center items-center min-h-[50vh]">
        <Loader size="lg" />
      </PageContainer>
    );
  }

  const { src: avatarSrc, initials } = getAvatarPropsForUser(user);

  const name = user.employee_name || user.username || user.name || '—';
  const email = user.email || '—';
  const company = user.company || '—';
  const designation = user.designation || '—';
  const joiningDate = user.joining_date || null;
  const workingLocation = user.working_location || '—';
  const branch = user.branch || '—';
  const contactNo = user.contact_no || '—';
  const dateOfBirth = user.date_of_birth || null;
  const empCode = user.emp_code || '—';
  const empId = user.emp_id || '—';

  const companyNorm = company?.toLowerCase() || '';
  const isAIA = companyNorm.includes('aia');
  const isVega = companyNorm.includes('vega');

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

      <PageContainer className="px-xl py-xl">
        <div className="max-w-5xl mx-auto">
          {/* Profile Card */}
          <div className="bg-card rounded-card shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-transform transition-shadow duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start gap-6 p-xl border-border bg-primary-opacity-10">
              <Avatar className="h-20 w-20 border border-border">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              {/* Top row: name, designation, company as label+icon+value rows */}
              <div className="pt-lg pl-lg grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <InfoItem icon={User} label="Name" value={name} />
                <InfoItem icon={Briefcase} label="Designation" value={designation} />
                <InfoItem icon={Building2} label="Company" value={company} />
              </div>
            </div>

            {/* Info Grid */}
            <div className="p-xl">
              <h3 className="font-semibold mb-6 text-gray-dark">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoItem icon={Mail} label="Email" value={email} />
                <InfoItem icon={Phone} label="Contact" value={contactNo} />
                <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(dateOfBirth)} />
                <InfoItem icon={Calendar} label="Joining Date" value={formatDate(joiningDate)} />

                {isVega && (
                  <InfoItem icon={MapPin} label="Working Location" value={workingLocation} />
                )}

                {isAIA && (
                  <>
                    <InfoItem icon={Building2} label="Branch" value={branch} />
                    <InfoItem icon={Hash} label="Employee Code" value={empCode} />
                  </>
                )}

                {isVega && (
                  <InfoItem icon={IdCard} label="Employee ID" value={empId} />
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}