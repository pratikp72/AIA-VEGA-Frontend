'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

const iconColors = [
  'bg-green-100',
  'bg-blue-100',
  'bg-purple-100',
  'bg-orange-100',
  'bg-indigo-100',
  'bg-red-100',
  'bg-pink-100',
  'bg-teal-100',
  'bg-rose-100',
  'bg-cyan-100',
  'bg-amber-100',
  'bg-orange-100',
];

export default function QuickLinks({ links = [] }) {
  if (links.length === 0) return null;

  const renderIcon = (icon) => {
    if (!icon) return null;

    if (icon.iconData) {
      return <span dangerouslySetInnerHTML={{ __html: icon.iconData }} />;
    }

    if (icon.iconUrl) {
      return <img src={icon.iconUrl} alt="" className="w-8 h-8 object-contain" />;
    }

    if (icon.iconText) {
      return <span>{icon.iconText}</span>;
    }

    return null;
  };

  return (
    <section>
      <h2 className="text-h2 mb-6">Quick Links</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {links.map((link, index) => (
          <Link key={link.id} href={link.url || '#'} target='_blank' className="block h-full ">
            <Card className="h-full p-4 hover:shadow-lg transition-shadow cursor-pointer border-gray-200 bg-white">
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className={`w-16 h-16 rounded-2xl ${
                    iconColors[index % iconColors.length]
                  } flex items-center justify-center text-h2`}
                >
                  {renderIcon(link.icon)}
                </div>
                <span
                  className="text-[12px] leading-4 font-medium text-gray-700 min-h-8 line-clamp-2"
                  title={link.title || link.name}
                >
                  {link.title || link.name}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}