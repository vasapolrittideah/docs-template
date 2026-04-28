'use client';

import { RiArrowRightSLine } from '@remixicon/react';
import * as Dropdown from '../common/dropdown';
import TOC from '../layout/toc';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const TOCDropdown = () => {
  const t = useTranslations('TOC');
  const [align, setAlign] = useState<'start' | 'end'>('start');
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setAlign('start');
      } else {
        setAlign('end');
      }
      if (isOpenRef.current) setIsOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dropdown.Trigger asChild>
        <div role="button" className="mx-4 my-2 cursor-pointer">
          <div className="text-text-sub-600 hover:text-text-strong-950 flex items-center gap-1 text-sm select-none">
            <span>{t('label')}</span>
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
              <RiArrowRightSLine size={16} />
            </motion.div>
          </div>
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content align={align} className="w-[calc(100vw-6rem)] md:w-75">
        <TOC showTitle={false} variant="top" onHeadingClick={() => setIsOpen(false)} />
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default TOCDropdown;
