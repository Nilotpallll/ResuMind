import { useEffect, useRef } from "react";

function CursorGlow() {
  const glowRef = useRef(null);
  const coreRef = useRef(null);

  const targetRef = useRef({
    x: 0,
    y: 0,
  });

  const positionRef = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove,
      { passive: true }
    );

    let animationFrame;

    const animate = () => {
      const target = targetRef.current;
      const position = positionRef.current;

      position.x +=
        (target.x - position.x) * 0.075;

      position.y +=
        (target.y - position.y) * 0.075;

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate3d(
            ${position.x - 320}px,
            ${position.y - 320}px,
            0
          )`;
      }

      if (coreRef.current) {
        coreRef.current.style.transform =
          `translate3d(
            ${position.x - 90}px,
            ${position.y - 90}px,
            0
          )`;
      }

      animationFrame =
        requestAnimationFrame(animate);
    };

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  return (
    <>
      {/* Large atmospheric liquid light */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-0 h-[640px] w-[640px] rounded-full opacity-70 blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.13) 0%, rgba(99,102,241,0.075) 25%, rgba(139,92,246,0.035) 45%, transparent 70%)",
          willChange: "transform",
        }}
      />

      {/* Smaller liquid core */}
      <div
        ref={coreRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-0 h-[180px] w-[180px] rounded-full opacity-60 blur-[35px]"
        style={{
          background:
            "radial-gradient(circle, rgba(147,197,253,0.13) 0%, rgba(96,165,250,0.07) 35%, rgba(139,92,246,0.035) 55%, transparent 72%)",
          willChange: "transform",
        }}
      />

      {/* Very subtle center highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(96,165,250,0.035), transparent 32%)",
        }}
      />
    </>
  );
}

export default CursorGlow;