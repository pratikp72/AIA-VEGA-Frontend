"use client";

import Link from "next/link";
import { Clock, MapPin, Monitor } from "lucide-react";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

const defaultDescription =
  "Annual Tech Conference 2024 brings together industry leaders and teams for a day of insights, innovation, and collaboration shaping the future of technology.";

/* Selection colors – per-card vertical bar (orange, purple, green, purple, blue, yellow) */

const CARD_BAR_COLORS = [
  "#FD8C02",
  "#9C2EDB",
  "#00F078",
  "#F0C51A",
  "#9C2EDB",
  "#2563EB",
];
export default function UpcomingEvents({ events = [] }) {
  if (events.length === 0) return null;

  const hasFullEventGrid = events.length >= 6;

  const isVirtual = (loc) => /virtual|online/i.test(loc || "");

  return (
    <section
      className={`flex flex-col items-start w-full self-stretch ${
        hasFullEventGrid ? "min-h-[579px]" : ""
      }`}
      style={{ gap: "24px" }}
    >
      {/* Header: title + View Full Calendar link */}
      <div className="flex items-center justify-between w-full">
        <h2 className="text-h2 text-foreground">Event Calendar</h2>
        <Link
          href="/calendar"
          className="text-body text-primary hover:underline font-medium"
        >
          View Full Calendar →
        </Link>
      </div>

      {/* Grid of event cards – 24px gap from header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {events.slice(0, 6).map((event, index) => (
          <Link
            key={event.id}
            href={`/calendar?eventId=${encodeURIComponent(String(event.documentId ?? event.id ?? ""))}${event.date ? `&date=${encodeURIComponent(event.date)}` : ""}`}
            className="w-full"
          >
            <div className="flex flex-row items-stretch min-h-[165px] w-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-200 bg-white rounded-[20px] shadow-sm">
              {/* Left: Date + colored vertical bar */}
              <div className="flex flex-shrink-0 self-stretch">
                <div className="flex flex-col justify-center items-center py-4 pl-4 pr-3 gap-0 min-w-[72px] self-stretch">
                  <span className="text-small text-[#78909E] font-medium camelcase mb-1">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>
                  <span className="text-h2 leading-none text-[#3C435F] font-bold">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                <div
                  className="w-1 self-stretch flex-shrink-0 my-3"
                  style={{
                    backgroundColor:
                      CARD_BAR_COLORS[index % CARD_BAR_COLORS.length],
                  }}
                  aria-hidden
                />
              </div>

              {/* Right: Event details (column) */}
              <div className="flex flex-col justify-center gap-3 p-4 pl-4 flex-1 min-w-0">
                <h3 className="text-h3 text-[#3C435F] font-bold leading-tight">
                  {event.title}
                </h3>
                <div className="text-small text-[#78909E] line-clamp-2 leading-relaxed">
                  <div className="rich-content line-clamp-1">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: md.render(event.description || ""),
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-small text-[#78909E]">
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0 text-[#9C2EDB]" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {isVirtual(event.location) ? (
                      <Monitor className="w-4 h-4 flex-shrink-0 text-[#9C2EDB]" />
                    ) : (
                      <MapPin className="w-4 h-4 flex-shrink-0 text-[#9C2EDB]" />
                    )}
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
