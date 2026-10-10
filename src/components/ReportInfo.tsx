import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { WarningCircle, X } from '@phosphor-icons/react';

/** Explanations are opt-in; native dialog supplies focus containment and Escape. */
export function ReportInfo({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const readingPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus({ preventScroll: true });
      window.scrollTo({
        left: readingPosition.current.x,
        top: readingPosition.current.y,
        behavior: 'instant',
      });
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="report-info-trigger"
        aria-label={title}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          readingPosition.current = { x: window.scrollX, y: window.scrollY };
          setOpen(true);
        }}
      >
        <WarningCircle size={16} aria-hidden="true" />
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="report-info-dialog"
          aria-labelledby={id}
          aria-modal="true"
          onCancel={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Tab') return;
            const controls = [
              ...event.currentTarget.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], [tabindex="0"]',
              ),
            ];
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="report-info-content">
            <header>
              <h2 id={id}>{title}</h2>
              <button
                type="button"
                className="icon-button"
                aria-label="关闭说明"
                onClick={() => setOpen(false)}
                autoFocus
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>
            <div className="report-info-copy">{children}</div>
          </div>
        </dialog>
      )}
    </>
  );
}
