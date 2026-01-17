import { useEffect, useState, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
}

const ScrollReveal = ({ children, delay = 0 }: ScrollRevealProps) => {
  const [hasRevealed, setHasRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.unobserve(entry.target); // 👈 stop observing after first reveal
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${hasRevealed ? "active" : ""}`}
      style={{
        opacity: hasRevealed ? 1 : 0,
        transform: hasRevealed ? "translateY(0)" : "translateY(50px)",
        transition: `opacity 0.4s ease-out, transform 0.4s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
