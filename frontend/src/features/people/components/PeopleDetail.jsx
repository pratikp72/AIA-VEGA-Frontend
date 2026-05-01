"use client";

import { useEffect, useState } from 'react';
import SurfaceCard from '@/components/common/SurfaceCard';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, MapPin, Mail, Phone, X } from 'lucide-react';

export default function PeopleDetail({ selectedEmployee, onClose }) {
  if (!selectedEmployee) return null;

  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [selectedEmployee.id, selectedEmployee.avatar]);

  function formatExperience(joinDate, fallbackYears) {
  const parsed = joinDate ? new Date(joinDate) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    const now = new Date();
    let years = now.getFullYear() - parsed.getFullYear();
    let months = now.getMonth() - parsed.getMonth();

    if (now.getDate() < parsed.getDate()) {
      months -= 1;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years >= 0) {
      const parts = [];
      if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
      if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);
      return parts.join(' ') || '0 months';
    }
  }

  const yearsNum = Math.max(0, Number(fallbackYears) || 0);
  return yearsNum > 0 ? `${yearsNum} year${yearsNum === 1 ? '' : 's'}` : '0 months';
}

const experienceLabel = formatExperience(selectedEmployee.joinDate, selectedEmployee.yearsAtCompany);
  const avatarInitial = (selectedEmployee.avatarInitial || selectedEmployee.name?.[0] || '?').toUpperCase();
  const showImageAvatar = Boolean(selectedEmployee.avatar) && !hasImageError;

  const companyNorm = (selectedEmployee.company || '').trim().toLowerCase();
  const isAIA = companyNorm.includes('aia');
  const isVega = companyNorm.includes('vega');

  return (
    <SurfaceCard className="w-full border border-gray-200 bg-white p-0 xl:sticky xl:top-20 xl:max-w-[340px] xl:self-start gap-0 xl:max-h-[calc(100vh-6rem)] overflow-hidden xl:flex xl:flex-col">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
          {/* Image */}
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            {showImageAvatar ? (
              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="w-full h-full object-cover"
                onError={() => setHasImageError(true)}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                {avatarInitial}
              </div>
            )}
          </div>
          {/* Text content */}
          <div className="min-w-0">
            <h3 className="text-[22px] font-semibold leading-[28px] break-words">
              {selectedEmployee.name}
            </h3>
            <p className="mt-1 text-small text-muted-foreground break-words">
              {selectedEmployee.title}
            </p>

            {/* ID code with background and description */}
            {isAIA && selectedEmployee.emp_code && (
              <>
                <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#E9D8FD] text-primary-purple text-[15px] font-medium">
                  #{selectedEmployee.emp_code}
                </div>
                {selectedEmployee.description && (
                  <div className="text-[13px] text-muted-foreground mt-0.5 break-words">
                    {selectedEmployee.description}
                  </div>
                )}
              </>
            )}

            {isVega && selectedEmployee.emp_id && (
              <>
                <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#E9D8FD] text-primary-purple text-[15px] font-medium">
                  #{selectedEmployee.emp_id}
                </div>
                {selectedEmployee.description && (
                  <div className="text-[13px] text-muted-foreground mt-3 break-words">
                    {selectedEmployee.description}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close employee details">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-3 space-y-4 text-muted-foreground xl:flex-1 xl:min-h-0 xl:overflow-y-auto">
        <div className="flex items-center gap-2 min-w-0">
          <Briefcase className="h-4 w-4 shrink-0" />
          <span className="break-words">{selectedEmployee.department}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 shrink-0" />
<span className="break-words">{experienceLabel}</span>       
 </div>
        {isAIA ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="break-words">{selectedEmployee.branch || '-'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="break-words">{selectedEmployee.location}</span>
          </div>
        )}
        {typeof selectedEmployee.email === 'string' &&
          selectedEmployee.email.includes('@') &&
          !selectedEmployee.email.trim().toLowerCase().endsWith('@aia.internal') && (
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="break-all text-primary-purple">{selectedEmployee.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <Phone className="h-4 w-4 shrink-0" />
          <span className="break-words text-primary-purple">{selectedEmployee.phone}</span>
        </div>
      </div>
    </SurfaceCard>
  );
}
