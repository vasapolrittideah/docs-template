'use client';

import { useState } from 'react';
import { RiClipboardLine, RiCheckLine } from '@remixicon/react';

interface CopyButtonProps {
  code: string;
}

const CopyButton = ({ code }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="text-text-soft-400 cursor-pointer pr-1" aria-label="Copy code" role="button" onClick={handleCopy}>
      {isCopied ? <RiCheckLine size={20} /> : <RiClipboardLine size={20} />}
    </div>
  );
};

export default CopyButton;
