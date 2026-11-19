'use client';

import React from 'react';
import { Phone, MapPin, ExternalLink } from 'lucide-react';
import { RESTAURANT_INFO } from '@/lib/menu-data';

export const Header: React.FC = () => {
  return (
    <header className="bg-paper border-b border-hair">
      {/* Top micro banner */}
      <div className="bg-ink text-paper py-1.5 px-4 text-xs font-medium flex items-center justify-between border-b border-hair-dark">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>المحل مفتوح وجاهز لاستقبال طلباتكم</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={RESTAURANT_INFO.facebookPage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-hair hover:text-white transition-colors"
          >
            <span>صفحتنا على فيسبوك ({RESTAURANT_INFO.facebookFollowers})</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
          {/* Real Restaurant Logo */}
          <div className="shrink-0">
            <img
              src="/logo.png"
              alt="مسمط السيدة زينب"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#B91C1C] shadow-sm"
            />
          </div>

          {/* Titles & Descriptions */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                {RESTAURANT_INFO.name}
              </h1>
            </div>

            <p className="text-ink-2 font-medium text-sm sm:text-base mb-3 max-w-xl">
              {RESTAURANT_INFO.tagline} — حلويات لحوم، كوارع، طواجن فتة ولائم عائلية سخنة من الحلة للمائدة.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-mute">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>{RESTAURANT_INFO.locationDetails}</span>
              </div>
            </div>

            {/* Direct Dial numbers */}
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <a
                href={`tel:${RESTAURANT_INFO.phone1}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-warm border border-hair hover:border-accent text-ink text-xs sm:text-sm font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-accent" />
                <span className="tabular-nums" dir="ltr">{RESTAURANT_INFO.phone1}</span>
              </a>
              <a
                href={`tel:${RESTAURANT_INFO.phone2}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-warm border border-hair hover:border-accent text-ink text-xs sm:text-sm font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-accent" />
                <span className="tabular-nums" dir="ltr">{RESTAURANT_INFO.phone2}</span>
              </a>
              <span className="text-xs text-mute hidden md:inline">
                (أو اختر أصنافك واضغط إرسال لواتساب مباشرة)
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
