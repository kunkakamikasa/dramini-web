'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import clsx from 'clsx';
import { analytics } from '@/lib/analytics';

export type ChipOption = { label: string; value: string };

interface CategoryChipsProps {
  categories: string[];
  paramKey?: string;
  className?: string;
}

export function CategoryChips({ 
  categories, 
  paramKey = 'category', 
  className 
}: CategoryChipsProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const active = sp.get(paramKey) || '';

  const onClick = (value: string) => {
    const p = new URLSearchParams(sp.toString());
    if (value && value !== active) {
      p.set(paramKey, value);
    } else {
      p.delete(paramKey); // 再次点击清除筛选
    }
    router.push(`?${p.toString()}`, { scroll: false });
    analytics.categorySelect(value);
  };

  const options: ChipOption[] = useMemo(() => 
    categories.map(cat => ({ label: cat, value: cat.toLowerCase() })), 
    [categories]
  );

  return (
    <div className={clsx('relative', className)}>
      {/* 横向滚动 + scroll-snap；PC 自动换行 */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth scroll-px-4 md:flex-wrap md:overflow-visible">
        {options.map((opt) => {
          const selected = opt.value === active;
          return (
            <button
              key={opt.value}
              onClick={() => onClick(opt.value)}
              className={clsx(
                'shrink-0 scroll-ml-4 scroll-mr-4 snap-start',
                'px-4 py-2 rounded-full text-sm font-medium transition',
                selected
                  ? 'bg-primary text-white shadow-[0_6px_16px_rgba(229,9,20,.35)]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
              aria-pressed={selected}
              data-ev="category_select"
              data-meta={JSON.stringify({ category: opt.value })}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 两端渐隐，提示可横向滚动（仅移动端显示） */}
      <div className="pointer-events-none md:hidden absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none md:hidden absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}