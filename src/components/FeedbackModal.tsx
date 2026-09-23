import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: number | null;
  curriculumId: number | null;
}

export default function FeedbackModal({ isOpen, onClose, reportId, curriculumId }: FeedbackModalProps) {
  const [inaccuracyType, setInaccuracyType] = useState('');
  const [incorrectSection, setIncorrectSection] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inaccuracyType) {
      setErrorMsg('Please select an inaccuracy type.');
      return;
    }
    if (!explanation.trim()) {
      setErrorMsg('Please provide a detailed explanation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportId,
          curriculum_id: curriculumId,
          inaccuracy_type: inaccuracyType,
          incorrect_section: incorrectSection,
          explanation: explanation,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          // Reset fields and close modal
          setInaccuracyType('');
          setIncorrectSection('');
          setExplanation('');
          setSubmitSuccess(false);
          onClose();
        }, 2200);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      id="feedback-modal-overlay"
    >
      <div 
        className="relative max-w-lg w-full bg-white rounded-2xl border border-slate-100 shadow-2xl p-7 flex flex-col gap-5 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="feedback-modal-content"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Report AI Inaccuracy</h3>
              <p className="text-xs text-slate-400 mt-0.5">Help refine curriculum alignment recommendations</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Feedback Captured!</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Thank you for reporting. Our curriculum models will use this submission to calibrate alignment predictions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Inaccuracy Type Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-tight">
                Inaccuracy Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={inaccuracyType}
                onChange={(e) => setInaccuracyType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                required
              >
                <option value="">-- Choose Category --</option>
                <option value="Irrelevant Skill Recommendation">Irrelevant skill recommendation</option>
                <option value="Inaccurate Skill-Gap Assessment">Inaccurate skill-gap assessment</option>
                <option value="Mismatched Labor Market Demand">Mismatched labor market demand</option>
                <option value="Incorrect Topic Extraction">Incorrect course topics extraction</option>
                <option value="Other Inaccuracy">Other alignment inaccuracy</option>
              </select>
            </div>

            {/* Incorrect Section / Quote */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-tight">
                Which section is incorrect? <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={incorrectSection}
                onChange={(e) => setIncorrectSection(e.target.value)}
                placeholder="e.g. Recommended introducing Java classes..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Explanation / Suggested Correction */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-tight">
                Describe the inaccuracy & correct data <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={4}
                placeholder="Please describe why this recommendation is inaccurate, and what the correct skills/standards should be for this course..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none leading-relaxed"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Report</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
