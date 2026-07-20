'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MarkdownIt from 'markdown-it';
import {
  Briefcase,
  Building2,
  Calendar,
  Cake,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import SurfaceCard from '@/components/common/SurfaceCard';
import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchNewJoineeById } from '@/features/home/homeAPI';

const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

function formatBirthDate(dateOfBirth) {
  if (!dateOfBirth) return '';
  const parsed = new Date(dateOfBirth);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatJoinDate(joinDate) {
  if (!joinDate) return '';
  const parsed = new Date(joinDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getEmployeeCode(joinee) {
  const companyNorm = (joinee.company || '').trim().toLowerCase();
  if (companyNorm.includes('aia') && joinee.empCode) return joinee.empCode;
  if (companyNorm.includes('vega') && joinee.empId) return joinee.empId;
  return joinee.empCode || joinee.empId || '';
}

function renderRichContent(content) {
  const trimmed = String(content || '').trim();
  if (!trimmed) return '';
  return /<[^>]*>/.test(trimmed) ? trimmed : md.render(trimmed);
}

function DetailRow({ icon: Icon, label, value, valueClassName = '' }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 min-w-0">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light">
        <Icon className="h-4 w-4 text-primary-purple" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-0.5 text-body text-gray-dark break-words ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <SurfaceCard className="flex items-center gap-3 p-4">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
        <Icon className="h-4 w-4 text-primary-purple" />
      </span>
      <div className="min-w-0">
        <p className="text-small text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-body font-medium text-gray-name-title truncate">{value}</p>
      </div>
    </SurfaceCard>
  );
}

export default function NewJoineeWelcomePage() {
  const params = useParams();
  const id = params?.id;
  const [joinee, setJoinee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setNotFound(false);

    fetchNewJoineeById(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          setJoinee(null);
          return;
        }
        setJoinee(data);
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setJoinee(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setHasImageError(false);
  }, [joinee?.id, joinee?.avatar]);

  if (loading) {
    return <Loader className="mt-10" />;
  }

  if (notFound || !joinee) {
    return (
      <>
        <PageHeader
          title="New Joinee"
          breadcrumbs={[
            { label: 'Home', href: '/home' },
            { label: 'New Joinee' },
          ]}
          right={(
            <Link
              href="/home"
              className="flex items-center gap-2 text-small font-medium text-gray-medium hover:text-gray-dark hover:underline shrink-0"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </Link>
          )}
        />
        <PageSection>
          <SurfaceCard className="mx-auto max-w-2xl p-8 text-center">
            <h2 className="text-h2 text-gray-dark">Profile not found</h2>
            <p className="mt-2 text-body text-muted-foreground">
              This new joinee profile is unavailable or may no longer be active.
            </p>
            <Button asChild className="mt-6 h-10 rounded-full bg-primary text-white">
              <Link href="/home">Back to Home</Link>
            </Button>
          </SurfaceCard>
        </PageSection>
      </>
    );
  }

  const hasWelcomeNote = Boolean(String(joinee.welcomeNote || '').trim());
  const avatarInitial = (joinee.avatarInitial || joinee.name?.[0] || '?').toUpperCase();
  const showImageAvatar = Boolean(joinee.avatar) && !hasImageError;
  const isVega = (joinee.company || '').trim().toLowerCase().includes('vega');
  const employeeCode = getEmployeeCode(joinee);
  const showEmail =
    typeof joinee.email === 'string' &&
    joinee.email.includes('@') &&
    !joinee.email.trim().toLowerCase().endsWith('@aia.internal');

  return (
    <>
      <PageHeader
        title="Welcome Our New Joinee"
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'New Joinees', href: '/home' },
          { label: joinee.name },
        ]}
        right={(
          <Link
            href="/home"
            className="flex items-center gap-2 text-small font-medium text-gray-medium hover:text-gray-dark hover:underline shrink-0"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </Link>
        )}
      />

      <PageSection>
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <SurfaceCard className="p-4 lg:sticky lg:top-20">
              <div className="flex flex-col items-center text-center">
                <Badge className="mb-3 rounded-md bg-primary-light px-2 py-0.5 text-[10px] text-primary-purple">
                  New Joinee
                </Badge>
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-gray-100 bg-white shadow-sm">
                  {showImageAvatar ? (
                    <img
                      src={joinee.avatar}
                      alt={joinee.name}
                      className="h-full w-full object-cover"
                      onError={() => setHasImageError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-h2 font-semibold text-white">
                      {avatarInitial}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <h2 className="text-h2 text-gray-name-title">{joinee.name}</h2>
                  {employeeCode ? (
                    <span className="inline-block rounded-lg bg-[#E9D8FD] px-3 py-1 text-[15px] font-medium text-primary-purple">
                      #{employeeCode}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-4">
                  <DetailRow icon={Cake} label="Birthday" value={formatBirthDate(joinee.dateOfBirth)} />
                  <DetailRow icon={Calendar} label="Joining Date" value={formatJoinDate(joinee.joinDate)} />
                  <DetailRow icon={MapPin} label="Work Location" value={joinee.location} />
                  {isVega ? (
                    <DetailRow icon={Building2} label="Business Vertical" value={joinee.businessVertical} />
                  ) : null}
                  <DetailRow
                    icon={Phone}
                    label="Phone"
                    value={joinee.phone}
                    valueClassName="text-primary-purple"
                  />
                  {showEmail ? (
                    <DetailRow
                      icon={Mail}
                      label="Email"
                      value={joinee.email}
                      valueClassName="break-all text-primary-purple"
                    />
                  ) : null}
                </div>
              </div>
            </SurfaceCard>
          </aside>

          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InfoTile icon={Building2} label="Company" value={joinee.company} />
              <InfoTile icon={Briefcase} label="Department" value={joinee.department} />
              <InfoTile icon={UserRound} label="Designation" value={joinee.position} />
            </div>

            <SurfaceCard className="overflow-hidden p-0">
              <div className="border-b border-gray-200 bg-primary-light px-5 py-5">
                <p className="text-lg font-semibold tracking-wide text-primary-purple">
                  Welcome Message
                </p>
              </div>

              <div className="px-4 pb-3">
                {hasWelcomeNote ? (
                  <div
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: renderRichContent(joinee.welcomeNote) }}
                  />
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-body text-muted-foreground">
                      A welcome note has not been added for this team member yet.
                    </p>
                  </div>
                )}
              </div>
            </SurfaceCard>
          </div>
        </div>
      </PageSection>
    </>
  );
}
