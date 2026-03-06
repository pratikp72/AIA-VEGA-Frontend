"use client";

import FormTemplateCard from './FormTemplateCard';

export default function FormTemplatesGrid({ resources }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-6">
      {resources.map((r) => (
        <div key={r.id} className="w-full flex justify-center">
          <FormTemplateCard resource={r} />
        </div>
      ))}
    </div>
  );
}
