import React, { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  const [isRendered, setIsRendered] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered && !isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-2 sm:mx-4 max-h-[85vh] sm:max-h-[90vh] overflow-hidden transition-all duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors flex-shrink-0"
            onClick={onClose}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-2 sm:p-4 overflow-y-auto max-h-[60vh] sm:max-h-[65vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-2 sm:px-4 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-1 sm:gap-2 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
