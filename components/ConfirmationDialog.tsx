import React, { useEffect, useRef } from 'react';
import { AlertIcon } from './icons/AlertIcon';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  item?: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  item,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  const handleFocusTrap = (event: React.KeyboardEvent) => {
      if(event.key !== 'Tab' || !modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if(event.shiftKey) { // Shift + Tab
          if(document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
          }
      } else { // Tab
          if(document.activeElement === lastElement) {
              firstElement.focus();
              event.preventDefault();
          }
      }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      aria-labelledby="confirmation-dialog-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-md m-4 p-6 border border-[var(--border-color)]"
        tabIndex={-1}
        onKeyDown={handleFocusTrap}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500 bg-opacity-20 sm:mx-0 sm:h-10 sm:w-10">
            <AlertIcon />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-bold leading-6 text-[var(--text-primary)]" id="confirmation-dialog-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-[var(--text-secondary)]">{message}</p>
              {item && <p className="text-sm text-[var(--text-secondary)] italic mt-2 bg-[var(--bg-primary)] p-2 rounded-md border border-[var(--border-color)]">{item}</p>}
            </div>
          </div>
        </div>
        <div className="mt-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-[var(--border-color)] shadow-sm px-4 py-2 bg-[var(--bg-tertiary)] text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
