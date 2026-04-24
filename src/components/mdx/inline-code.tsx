export interface InlineCodeProps {
  children: React.ReactNode;
}

const InlineCode = ({ children }: InlineCodeProps) => {
  return (
    <code className="inline-code text-text-strong-950 inline-code bg-bg-soft-200 border-stroke-sub-300/50 rounded-md border px-2 py-px font-mono text-sm">
      {children}
    </code>
  );
};

export default InlineCode;
