import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

const getLanguage = (className: string | undefined): string | null => {
  if (!className) return null;
  const match = /language-(\w+)/.exec(className);
  return match ? match[1] : null;
};

// react-markdown passes the props of the element it's replacing.
// For `pre`, the `children` will be a `code` element.
interface CodeBlockProps {
  children?: React.ReactNode;
  [key: string]: any; // To accept other props from react-markdown
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // The `children` prop contains the `<code>` element.
  if (!React.isValidElement(children) || children.type !== 'code') {
    return <pre {...props}>{children}</pre>;
  }

  // FIX: Cast the child element's props to a known shape to fix type errors on `className` and `children`.
  const codeElement = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
  const language = getLanguage(codeElement.props.className);
  
  const codeString = String(codeElement.props.children).replace(/\n$/, '');

  const handleCopy = () => {
    if(!navigator.clipboard) return;
    navigator.clipboard.writeText(codeString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Gagal menyalin kode: ', err);
    });
  };

  return (
    <div className="relative mb-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--bg-tertiary)] rounded-t-lg border-b border-[var(--border-color)]">
        <span className="text-xs font-sans text-[var(--text-secondary)] uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Salin kode"
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
          <span className="hidden sm:inline">{isCopied ? 'Disalin!' : 'Salin'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm bg-transparent border-none m-0 rounded-b-lg" {...props}>
        {children}
      </pre>
    </div>
  );
};