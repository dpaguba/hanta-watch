import { useEffect, useRef, useState } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED).matches
  );
}

/** Reveals every `.reveal` element once it scrolls into view.
 *
 * Elements are found by class rather than wrapped in a component, so adding an
 * animation to a section costs one class name and no change to its markup.
 *
 * Pages here fetch their data after mounting, so most `.reveal` elements do not
 * exist yet when this runs. A MutationObserver picks up whatever appears later;
 * without it, a page whose content arrives asynchronously stays blank forever.
 */
export function useReveal(key: string): void {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const seen = new WeakSet<Element>();
    let failsafe = 0;

    const show = (el: Element) => el.classList.add("is-visible");

    const io = reduced
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              show(entry.target);
              io?.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
        );

    const sweep = () => {
      const nodes = document.querySelectorAll<HTMLElement>(".reveal");
      let added = false;
      nodes.forEach((n) => {
        if (seen.has(n)) return;
        seen.add(n);
        added = true;
        if (io) io.observe(n);
        else show(n);
      });
      if (!added || !io) return;

      // Anything the observer has not reported on shortly after appearing is
      // shown regardless. A section that stays invisible is worse than one
      // that skips its animation.
      window.clearTimeout(failsafe);
      failsafe = window.setTimeout(() => {
        document.querySelectorAll(".reveal").forEach(show);
      }, 1600);
    };

    // Hiding is switched on only after the observers exist, so a failure while
    // setting them up cannot leave content hidden with nothing to reveal it.
    document.documentElement.classList.add("js-reveal");
    sweep();
    const mo = new MutationObserver(sweep);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io?.disconnect();
      mo.disconnect();
      window.clearTimeout(failsafe);
      document.documentElement.classList.remove("js-reveal");
    };
  }, [key]);
}

/** Counts from zero up to `value` once, for the headline figures.
 *
 * Returns `value` immediately when the reader has asked for reduced motion, so
 * nobody who opted out of animation is shown an intermediate number.
 */
export function useCountUp(value: number, durationMs = 900): number {
  const skip = prefersReducedMotion() || !Number.isFinite(value);
  const [shown, setShown] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (skip) return;
    const started = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [value, durationMs, skip]);

  return skip ? value : shown;
}
