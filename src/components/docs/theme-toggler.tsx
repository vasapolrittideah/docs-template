/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { RiMoonFill, RiSunFill } from '@remixicon/react';
import { AnimatePresence, motion } from 'framer-motion';

import * as Button from '@/components/common/button';
import { useTheme } from '@teispace/next-themes';
import { useEffect, useState } from 'react';

const ThemeToggler = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isToggled = theme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button.Root variant="neutral" mode="stroke" size="medium" onClick={() => setTheme(isToggled ? 'dark' : 'light')}>
      <Button.Icon>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isToggled ? 'moon' : 'sun'}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            className="flex items-center justify-center">
            {isToggled ? <RiMoonFill size={22} /> : <RiSunFill size={22} />}
          </motion.div>
        </AnimatePresence>
      </Button.Icon>
    </Button.Root>
  );
};

export default ThemeToggler;
