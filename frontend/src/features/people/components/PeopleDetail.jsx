"use client";

import SurfaceCard from '@/components/common/SurfaceCard';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, MapPin, Mail, Phone, X } from 'lucide-react';

export default function PeopleDetail({ selectedEmployee, onClose }) {
  if (!selectedEmployee) return null;

  return (
    <SurfaceCard className="w-full border border-gray-200 bg-white p-4 xl:sticky xl:top-6 xl:max-w-[340px] xl:self-start">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[22px] font-semibold leading-[28px]">{selectedEmployee.name}</h3>
          <p className="mt-1 text-small text-muted-foreground">{selectedEmployee.title}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close employee details">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-px w-full bg-gray-200" />

      <div className="mt-2 space-y-4 text-gray-200 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          <span>{selectedEmployee.department}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>{selectedEmployee.yearsAtCompany} Years</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{selectedEmployee.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="truncate text-primary-purple">{selectedEmployee.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="text-primary-purple">{selectedEmployee.phone}</span>
        </div>
      </div>
    </SurfaceCard>
  );
}
