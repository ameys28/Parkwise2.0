const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl relative w-full max-w-md mx-auto border border-slate-100 transition-all duration-300 transform scale-100">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          onClick={onClose}
          aria-label="Close Modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
