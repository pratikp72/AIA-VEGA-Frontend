
import React from "react";
import { useSelector } from "react-redux";
import SurfaceCard from '@/components/common/SurfaceCard';
import Loader from '@/components/common/Loader';
import { selectFormTemplatesList, selectFormTemplatesLoading, selectFormTemplatesError } from '../formTemplatesSelectors';

export default function FormTemplatesList() {
  const templates = useSelector(selectFormTemplatesList);
  const loading = useSelector(selectFormTemplatesLoading);
  const error = useSelector(selectFormTemplatesError);

  if (loading) return <Loader className="mt-10" />;
  if (error) return <div className="text-red-500 mt-10">{error}</div>;

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {templates.map((template) => (
        <SurfaceCard key={template.id} className="p-4 rounded-[12px] shadow-sm">
          <h2 className="text-xl font-bold mb-2">{template.title}</h2>
          <p className="text-sm text-[#65758B] mb-1">Type: {template.form_type}</p>
          {template.form_type === 'URL' && template.form_url ? (
            <a href={template.form_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm mb-1 break-all">{template.form_url}</a>
          ) : null}
          <p className="text-sm text-[#374151] mt-2">{template.description}</p>
          <p className="text-xs text-[#475569] mt-2">Updated: {new Date(template.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </SurfaceCard>
      ))}
    </div>
  );
}
