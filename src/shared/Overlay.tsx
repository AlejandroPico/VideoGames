import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export default function Overlay({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    node
      ?.querySelector<HTMLElement>("button,input,select,a,[tabindex]")
      ?.focus();
    const handle = (e: KeyboardEvent) => {
      // A stacked dialog owns keyboard handling only while it is uppermost.
      if (
        Array.from(
          document.querySelectorAll('[role="dialog"][aria-modal="true"]'),
        ).at(-1) !== node
      )
        return;
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const elements = Array.from(
        node.querySelectorAll<HTMLElement>(
          "button:not([disabled]),a[href],input,select,textarea,[tabindex='0']",
        ),
      ).filter((el) => el.getClientRects().length);
      if (!elements.length) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && document.activeElement === elements[0]) {
        e.preventDefault();
        elements.at(-1)?.focus();
      } else if (!e.shiftKey && document.activeElement === elements.at(-1)) {
        e.preventDefault();
        elements[0].focus();
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, []);
  return (
    <div className={"integrated-overlay " + className} onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="integrated-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-heading">
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label={"Cerrar " + title.toLowerCase()}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
