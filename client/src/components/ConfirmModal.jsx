export default function ConfirmModal({ title, body, confirmLabel = 'Yes', cancelLabel = 'No', onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className={`text-white font-semibold text-lg ${body ? 'mb-2' : 'mb-6'}`}>{title}</h2>
        {body && <p className="text-slate-400 text-sm mb-6">{body}</p>}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
