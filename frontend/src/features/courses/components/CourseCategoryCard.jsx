'use client';

import Link from 'next/link';
import SurfaceCard from '@/components/common/SurfaceCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CourseCategoryCard({
  title,
  description,
  modules,
  hours,
  image,
  href,
}) {
  return (
    <SurfaceCard className="relative overflow-hidden border-0 p-0 text-white">
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
      </div>

      <div className="relative z-10 flex min-h-[170px] flex-col gap-6 p-6 sm:min-h-[190px] sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-h2 text-white">{title}</h3>
          <Badge className="rounded-md px-2 bg-primary/50 text-white border border-transparent">
            {modules} modules
          </Badge>
          <Badge className="rounded-md px-2 bg-primary/50 text-white border border-transparent">
            {hours}
          </Badge>
        </div>

        <p className="text-body text-white/80 max-w-3xl">
          {description}
        </p>

        <div>
          <Button asChild size="sm" className="rounded-md mt-2 bg-primary text-white hover:bg-primary/90">
            <Link href={href || '#'} prefetch={false} className="flex items-center gap-2">
              View Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </SurfaceCard>
  );
}
