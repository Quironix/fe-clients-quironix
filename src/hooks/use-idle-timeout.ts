import { useEffect, useRef, useState } from "react";

interface UseIdleTimeoutOptions {
  timeoutMs: number;
  warningMs: number;
  onWarning: () => void;
  onExpire: () => void;
}

interface UseIdleTimeoutReturn {
  isWarning: boolean;
  resetTimer: () => void;
}

export function useIdleTimeout({
  timeoutMs,
  warningMs,
  onWarning,
  onExpire,
}: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
  const [isWarning, setIsWarning] = useState(false);

  const phaseARef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseBRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const throttleRef = useRef(false);

  const resetTimer = () => {
    if (phaseARef.current !== null) clearTimeout(phaseARef.current);
    if (phaseBRef.current !== null) clearTimeout(phaseBRef.current);

    setIsWarning(false);

    phaseARef.current = setTimeout(() => {
      setIsWarning(true);
      onWarning();

      phaseBRef.current = setTimeout(() => {
        onExpire();
      }, timeoutMs - warningMs);
    }, warningMs);
  };

  useEffect(() => {
    const handleActivity = () => {
      if (throttleRef.current) return;
      throttleRef.current = true;
      resetTimer();
      setTimeout(() => {
        throttleRef.current = false;
      }, 300);
    };

    const originalFetch = window.fetch;
    window.fetch = (...args: Parameters<typeof fetch>) => {
      resetTimer();
      return originalFetch.apply(window, args);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "click",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, handleActivity));

    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      window.fetch = originalFetch;
      if (phaseARef.current !== null) clearTimeout(phaseARef.current);
      if (phaseBRef.current !== null) clearTimeout(phaseBRef.current);
    };
  }, []);

  return { isWarning, resetTimer };
}
