import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;


  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="glass animate-slide-up relative w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text"
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
