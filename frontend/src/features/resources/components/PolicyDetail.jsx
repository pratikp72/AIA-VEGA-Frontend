"use client";

import { useEffect, useState } from "react";
import SurfaceCard from "@/components/common/SurfaceCard";
import PageContainer from "@/components/layout/PageContainer";
import { Calendar } from "lucide-react";
import MarkdownIt from "markdown-it";
import Loader from "@/components/common/Loader";
const md = new MarkdownIt({ html: true });

export default function PolicyDetail({ item, fetchPolicyById }) {
  const [policy, setPolicy] = useState(null);
  const [html, setHtml] = useState("");
  const [headings, setHeadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!item || !item.documentId) {
      setLoading(false);
      return;
    }
    fetchPolicyById(item.documentId)
      .then((data) => {
        setPolicy(data);
        if (!data || !data.description) {
          setHtml("");
          setHeadings([]);
          setLoading(false);
          return;
        }
        try {
          // If description looks like HTML, use as is. Otherwise, render as Markdown.
          const desc = data.description || "";
          const stripped = desc.replace(/<[^>]*>/g, "");
          const htmlContent = md.render(stripped);
          setHtml(htmlContent);
        } catch (e) {
          setHtml(data.description || "");
          setHeadings([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setPolicy(null);
        setHtml("");
        setHeadings([]);
        setLoading(false);
      });
  }, [item]);

  if (loading) return <Loader className="mt-10" />;
  if (!policy) return null;

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return d;
    }
  };

  const renderSummary = (description) => {
    if (!description) return "";

    // Strip HTML tags first, then render markdown
    const stripped = description.replace(/<[^>]*>/g, "");
    return md.render(stripped);
  };

  return (
    <>
      <PageContainer className="pt-0 px-4 sm:px-6 lg:px-0">
        <SurfaceCard className="p-4 rounded-[12px] shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {(policy?.tags || item.tags) && (
                <span className="inline-flex items-center bg-primary-purple text-white text-xs font-medium px-3 py-1 rounded-full">
                  {Array.isArray(policy?.tags)
                    ? policy.tags.join(", ")
                    : policy?.tags || item.tags}
                </span>
              )}
              {item.title && (
                <h2 className="text-2xl font-bold mt-3 mb-2">{item.title}</h2>
              )}
              <p className="text-sm text-[#475569] mt-1">
                Standards and behaviours expected from all employees to maintain
                a professional workplace.
              </p>
              <p
                className="text-sm text-[#65758B]"
                dangerouslySetInnerHTML={{
                  __html: renderSummary(item.summary),
                }}
              ></p>
              <div className="mt-4 flex items-center gap-4 text-sm text-[#65758B]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Updated{" "}
                    {formatDate(policy?.updatedAt || policy?.date || item.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <div className="w-full gap-10 mt-6">
          <div className="">
            <SurfaceCard className="p-4 max-h-[520px] overflow-y-auto scrollbar-default gap-2">
              <div className="mb-3">
                <h3 className="text-lg font-semibold">Policy Details</h3>
              </div>
              <div className="rich-content">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      html || policy?.description || item.description || "",
                  }}
                />
              </div>
            </SurfaceCard>
          </div>

          {/* <aside className="lg:col-span-4">
            <SurfaceCard className="p-4">
              <h4 className="font-semibold">Quick Navigation</h4>
              <ol className="text-sm text-[#65758B] list-decimal list-inside space-y-2">
                {headings.map((h) => (
                  <li key={h.id}><a href={`#${h.id}`} className="text-primary hover:underline">{h.text}</a></li>
                ))}
              </ol>
            </SurfaceCard>
          </aside> */}
        </div>
      </PageContainer>
    </>
  );
}
