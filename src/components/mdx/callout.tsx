'use client';

import {
  RiArrowRightSLine,
  RiBugFill,
  RiErrorWarningFill,
  RiInformation2Fill,
  RiLightbulbFill,
} from '@remixicon/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface CalloutProps {
  type: 'info' | 'tip' | 'warning' | 'danger';
  children: React.ReactNode;
  isCollapsed?: boolean;
}

const Callout = ({ type, children, isCollapsed = false }: CalloutProps) => {
  const [isOpen, setIsOpen] = useState(!isCollapsed);

  let icon: ReactNode = null;
  let bgColor = '';
  let titleColor = '';
  let contentColor = '';

  const title = Array.from(children as ReactNode[])[0];
  const content = Array.from(children as ReactNode[]).slice(1);

  switch (type) {
    case 'info':
      icon = <RiInformation2Fill className="text-orange-800 dark:text-orange-300" />;
      bgColor =
        'border-orange-200 dark:border-orange-950/50 bg-orange-100 dark:bg-orange-950/50 [&_.inline-code]:border-orange-300/80 [&_.inline-code]:bg-orange-300/80 dark:[&_.inline-code]:border-orange-950/80 dark:[&_.inline-code]:bg-orange-950/80';
      titleColor = 'text-orange-800 dark:text-orange-300 [&_.inline-code]:text-orange-800';
      contentColor = '[&_.inline-code]:text-orange-900 dark:[&_.inline-code]:text-orange-200';
      break;
    case 'tip':
      icon = <RiLightbulbFill className="text-orange-800 dark:text-orange-300" />;
      bgColor =
        'border-orange-200 dark:border-orange-950/50 bg-orange-100 dark:bg-orange-950/50 [&_.inline-code]:border-orange-300/50 [&_.inline-code]:bg-orange-300/50 dark:[&_.inline-code]:border-orange-950/50 dark:[&_.inline-code]:bg-orange-950/50';
      titleColor = 'text-orange-800 dark:text-orange-300 [&_.inline-code]:text-orange-800';
      contentColor = '[&_.inline-code]:text-orange-900 dark:[&_.inline-code]:text-orange-200';
      break;
    case 'warning':
      icon = <RiErrorWarningFill className="text-red-800 dark:text-red-300" />;
      bgColor =
        'border-red-200 dark:border-red-950/50 bg-red-100 dark:bg-red-950/50 [&_.inline-code]:border-red-300/50 [&_.inline-code]:bg-red-300/50 dark:[&_.inline-code]:border-red-950/50 dark:[&_.inline-code]:bg-red-950/50';
      titleColor = 'text-red-800 dark:text-red-300 [&_.inline-code]:text-red-800';
      contentColor = '[&_.inline-code]:text-red-900 dark:[&_.inline-code]:text-red-200';
      break;
    case 'danger':
      icon = <RiBugFill className="text-red-800 dark:text-red-300" />;
      bgColor =
        'border-red-200 dark:border-red-950/50 bg-red-100 dark:bg-red-950/50 [&_.inline-code]:border-red-300/50 [&_.inline-code]:bg-red-300/50 dark:[&_.inline-code]:border-red-950/50 dark:[&_.inline-code]:bg-red-950/50';
      titleColor = 'text-red-800 dark:text-red-300 [&_.inline-code]:text-red-800';
      contentColor = '[&_.inline-code]:text-red-900 dark:[&_.inline-code]:text-red-200';
      break;
  }

  if (isCollapsed) {
    return (
      <div data-callout-type={type} className={twMerge('callout mb-4 rounded-xl border pb-0', bgColor)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="callout-title flex w-full cursor-pointer items-center gap-1 p-4 select-none">
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
            <RiArrowRightSLine className={titleColor} />
          </motion.div>
          <span className={twMerge(titleColor, 'text-lg font-semibold [&_.inline-code]:text-lg [&_p]:mb-0')}>
            {title}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden">
              <div className={twMerge(contentColor, 'callout-content p-4 pt-0')}>{content}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      data-callout-type={type}
      className={twMerge('callout mb-4 rounded-xl border [&_.inline-code]:border', bgColor)}>
      <div className="callout-title dark:border-b-orange-alpha-10 flex w-full gap-2 p-4 text-lg font-semibold">
        {icon}
        <span className={twMerge(titleColor, 'text-lg [&_.inline-code]:text-lg')}>{title}</span>
      </div>
      <div className={twMerge(contentColor, 'callout-content p-4 pt-0')}>{content}</div>
    </div>
  );
};

export default Callout;
