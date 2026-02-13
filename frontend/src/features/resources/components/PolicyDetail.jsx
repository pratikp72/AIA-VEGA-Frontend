"use client";

import { useEffect, useState } from 'react';
import SurfaceCard from '@/components/common/SurfaceCard';
import PageContainer from '@/components/layout/PageContainer';
import { Calendar, Users } from 'lucide-react';

function slugify(text) {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  );
}

export default function PolicyDetail({ item }) {
  const [html, setHtml] = useState('');
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    if (!item || !item.description) {
      setHtml('');
      setHeadings([]);
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(item.description, 'text/html');

      // collect headings in document order: h1-h6 and <p> that start with <strong> or <b>
      const nodes = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6,p'));

      const used = new Set();
      const nav = [];

      nodes.forEach((node, idx) => {
        if (node.tagName && /^H[1-6]$/.test(node.tagName)) {
          const text = (node.textContent || `section-${idx + 1}`).trim();
          if (text.toLowerCase() === 'overview') {
            // remove overview heading from document and nav
            node.remove();
            return;
          }
          let id = node.getAttribute('id') || slugify(text) || `section-${idx + 1}`;
          let base = id;
          let i = 1;
          while (used.has(id)) {
            id = `${base}-${i}`;
            i += 1;
          }
          used.add(id);
          node.setAttribute('id', id);
          nav.push({ id, text });
        } else if (node.tagName === 'P') {
          const first = node.firstElementChild;
          if (first && (first.tagName === 'STRONG' || first.tagName === 'B')) {
            const text = (first.textContent || `section-${idx + 1}`).trim();
            if (text.toLowerCase() === 'overview') {
              node.remove();
              return;
            }
            let id = node.getAttribute('id') || slugify(text) || `section-${idx + 1}`;
            let base = id;
            let i = 1;
            while (used.has(id)) {
              id = `${base}-${i}`;
              i += 1;
            }
            used.add(id);

            // transform <p><strong>Title</strong> Rest...</p>
            // into <h4 id="...">Title</h4><p>Rest...</p>
            const strongHtml = first.outerHTML;
            const innerHtml = node.innerHTML || '';
            const restHtml = innerHtml.replace(strongHtml, '').trim();

            const h = doc.createElement('h4');
            h.textContent = text;
            h.setAttribute('id', id);

            const p = doc.createElement('p');
            p.innerHTML = restHtml;

            node.replaceWith(h, p);

            nav.push({ id, text });
          }
        }
      });

      const serialized = doc.body.innerHTML;
      setHtml(serialized);
      setHeadings(nav);
    } catch (e) {
      setHtml(item.description || '');
      setHeadings([]);
    }
  }, [item]);

  if (!item) return null;

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return d;
    }
  };

  return (
    <>
      <PageContainer className="pt-0 px-4 sm:px-6 lg:px-0">
        <SurfaceCard className="p-4 rounded-[12px] shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {item.tag && <span className="inline-flex items-center bg-primary-purple text-white text-xs font-medium px-3 py-1 rounded-full">{item.tag}</span>}
              {item.title && <h2 className="text-2xl font-bold mt-3 mb-2">{item.title}</h2>}
              <p className="text-sm text-[#475569] mt-1">Standards and behaviours expected from all employees to maintain a professional workplace.</p>
              <p className="text-sm text-[#65758B]">{item.summary || ''}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-[#65758B]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(item.date)}</span>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-6">
          <div className="lg:col-span-8">
              <SurfaceCard className="p-4 max-h-[520px] overflow-y-auto scrollbar-default">
                <div className="mb-3"><h3 className="text-lg font-semibold">Policy Details</h3></div>
                <div className="prose max-w-none leading-relaxed text-sm text-[#374151]">
                {html ? (
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                  <>
                    <p className="mt-4">{item.description}</p>
                  </>
                )}
              </div>
            </SurfaceCard>
          </div>

          <aside className="lg:col-span-4">
            <SurfaceCard className="p-4">
              <h4 className="font-semibold">Quick Navigation</h4>
              <ol className="text-sm text-[#65758B] list-decimal list-inside space-y-2">
                {headings.map((h) => (
                  <li key={h.id}><a href={`#${h.id}`} className="text-primary hover:underline">{h.text}</a></li>
                ))}
              </ol>
            </SurfaceCard>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
