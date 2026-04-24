import { codeToHtml } from '@/lib/shiki';
import CopyButton from './copy-button';
import { twMerge } from 'tailwind-merge';

interface CodeBlockProps {
  code: string;
  language: string;
  filePath?: string;
  enableCopy?: boolean;
}

const CodeBlock = async ({ code, language, filePath, enableCopy = true }: CodeBlockProps) => {
  const html = await codeToHtml(code.trim(), {
    lang: language,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    defaultColor: 'light-dark()',
  });

  const isCommandLine = language === 'bash' || language === 'shell' || language === 'sh';

  return (
    <div className="border-stroke-soft-200 mb-4 flex flex-col rounded-xl border bg-gray-50 dark:bg-gray-900">
      {((!isCommandLine && filePath) || isCommandLine) && (
        <div className="border-b-stroke-soft-200 flex items-center justify-between border-b p-3">
          <div className="text-text-soft-400 pl-2 font-mono text-sm">{isCommandLine ? 'terminal' : filePath}</div>
          {enableCopy && <CopyButton code={code} />}
        </div>
      )}

      <div
        className={twMerge(
          'overflow-hidden bg-transparent dark:bg-transparent',
          filePath ? 'rounded-b-xl' : 'rounded-xl',
        )}>
        <div className="code-block scrollbar-thumb-gray-400 scrollbar-track-gray-100 flex max-h-250 overflow-auto px-6 pt-4 font-mono text-[15px] leading-6">
          {html ? (
            <div
              className="mb-4 h-full w-fit [&>pre]:bg-gray-50! dark:[&>pre]:bg-gray-900!"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <pre className="mb-4 h-full w-fit bg-gray-50 dark:bg-gray-900">{code.trim()}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;
