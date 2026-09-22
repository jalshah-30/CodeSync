import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import { Terminal, MousePointer } from "lucide-react";

interface WordProps {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.22, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block transition-opacity duration-75">
      {children}
    </motion.span>
  );
};

export const LandingStatement: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.35"],
  });

  // Statement text broken into elements
  const tokens = [
    { text: "Pair", type: "word" },
    { text: "programming", type: "word" },
    { text: "shouldn't", type: "word" },
    { text: "need", type: "word" },
    { text: "a", type: "word" },
    { text: "screen", type: "word" },
    { text: "share,", type: "word" },
    {
      type: "chip-cursor",
      label: "Jal Shah",
      color: "#70A6FF",
    },
    { text: "a", type: "word" },
    { text: "call", type: "word" },
    { text: "link", type: "word" },
    { text: "and", type: "word" },
    { text: "a", type: "word" },
    { text: "chat", type: "word" },
    { text: "tab.", type: "word" },
    { text: "CodeSync", type: "word" },
    { text: "puts", type: "word" },
    { text: "the", type: "word" },
    { text: "editor,", type: "word" },
    { text: "the", type: "word" },
    { text: "voice", type: "word" },
    {
      type: "chip-terminal",
      label: "$ run ⬩ Exit 0",
    },
    { text: "and", type: "word" },
    { text: "the", type: "word" },
    { text: "run", type: "word" },
    { text: "button", type: "word" },
    { text: "in", type: "word" },
    { text: "one", type: "word" },
    { text: "room.", type: "word" },
  ];

  const total = tokens.length;

  return (
    <section
      ref={containerRef}
      className="py-24 md:py-36 px-4 bg-ink text-cream relative select-none"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-2xl sm:text-3xl md:text-5xl font-display font-semibold leading-[1.25] tracking-tight flex flex-wrap items-center gap-x-3 gap-y-3">
          {tokens.map((token, index) => {
            const start = index / total;
            const end = Math.min(1, (index + 1.5) / total);

            if (token.type === "chip-cursor") {
              return (
                <Word key={`chip-cursor-${index}`} progress={scrollYProgress} range={[start, end]}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-royal/50 rounded-full text-xs md:text-sm font-sans font-medium text-cream align-middle my-1">
                    <span
                      style={{ backgroundColor: token.color }}
                      className="w-2.5 h-2.5 rounded-full inline-block"
                    />
                    <span>{token.label}</span>
                  </span>
                </Word>
              );
            }

            if (token.type === "chip-terminal") {
              return (
                <Word key={`chip-term-${index}`} progress={scrollYProgress} range={[start, end]}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-royal/50 rounded-full text-xs md:text-sm font-mono font-medium text-cream align-middle my-1">
                    <Terminal className="w-3.5 h-3.5 text-cream/70" />
                    <span>{token.label}</span>
                  </span>
                </Word>
              );
            }

            return (
              <Word key={`word-${index}`} progress={scrollYProgress} range={[start, end]}>
                {token.text}
              </Word>
            );
          })}
        </p>
      </div>
    </section>
  );
};
