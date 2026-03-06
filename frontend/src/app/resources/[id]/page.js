"use client";

import Link from 'next/link';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');
function getFormFileUrl(item) {
  if (item.form_type === 'URL' && item.form_url) return item.form_url;
  const m = item.form_pdf || item.form_excel || item.form_word;
  const raw = (Array.isArray(m) ? m[0] : m)?.url ?? (Array.isArray(m) ? m[0] : m)?.data?.attributes?.url;
  return raw ? (raw.startsWith('http') ? raw : `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`) : '';
}
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import PolicyDetail from '@/features/resources/components/PolicyDetail';
import PdfViewer from '@/features/resources/components/PdfViewer';
import { fetchPolicyById } from '@/features/resources/policiesAPI';
import { fetchFormTemplateById } from '@/features/resources/formTemplatesAPI';

export default function ResourceDetailPage() {
  const params = useParams();
  const documentId = params?.id || params?.slug || '';
  const [item, setItem] = useState(null);
  const [isFormTemplate, setIsFormTemplate] = useState(false);
  const [loading, setLoading] = useState(!!documentId);
  const formType = String(item?.form_type || '').toLowerCase();
  const isFormDownloadable = formType === 'pdf' || formType === 'excel' || formType === 'word';

  useEffect(() => {
    if (!documentId) return;
    setLoading(true);
    // Try to fetch as form template first
    fetchFormTemplateById(documentId)
      .then((data) => {
        if (data && data.id) {
          setItem(data);
          setIsFormTemplate(true);
          setLoading(false);
        } else {
          // fallback to policy
          fetchPolicyById(documentId)
            .then((data) => {
              setItem(data);
              setIsFormTemplate(false);
            })
            .catch(() => setItem(null))
            .finally(() => setLoading(false));
        }
      })
      .catch(() => {
        // fallback to policy
        fetchPolicyById(documentId)
          .then((data) => {
            setItem(data);
            setIsFormTemplate(false);
          })
          .catch(() => setItem(null))
          .finally(() => setLoading(false));
      });
  }, [documentId]);

  const policiesBgStyle = {
    backgroundImage: 'url(/policies-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={policiesBgStyle}>
      <PageHeader breadcrumbs={[{ label: 'Resources', href: '/resources' }, { label: isFormTemplate ? 'Forms & Templates' : 'Policies' }]} containerClassName="pt-xl pb-0 px-xl bg-transparent">
        <div className="flex items-center gap-4">
          <Link href="/resources" className="text-sm text-primary hover:underline">&larr; Back to {isFormTemplate ? 'Forms & Templates' : 'Policies'}</Link>
        </div>
      </PageHeader>
      <PageSection>
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : isFormTemplate && item ? (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
            <p className="text-sm text-[#65758B] mb-1">Type: {item.form_type}</p>
            <p className="text-sm text-[#374151] mt-2">{item.description}</p>
            <p className="text-xs text-[#475569] mt-2">Updated: {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            {isFormDownloadable && getFormFileUrl(item) && (
              <a
                href={getFormFileUrl(item)}
                download={item.form_type !== 'URL'}
                target={item.form_type === 'URL' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Download
              </a>
            )}
            {item.form_type === 'URL' && item.form_url && (
              <a
                href={item.form_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark ml-2"
              >
                Go to Form
              </a>
            )}
            {item.form_type === 'PDF' && getFormFileUrl(item) && (
              <PdfViewer fileUrl={getFormFileUrl(item)} title="PDF Preview" className="w-full h-96 mt-4 border rounded" />
            )}
          </div>
        ) : (
          <PolicyDetail item={item} fetchPolicyById={fetchPolicyById} />
        )}
      </PageSection>
    </div>
  );
}

