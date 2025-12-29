"use client";

import { useState, useEffect, Fragment, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

const Ring = dynamic(() => import('@/components/ring').then(mod => mod.Ring), {
  ssr: false,
  loading: () => <div className="w-64 h-64" />,
});

const BouncingHeart = () => (
  <motion.div
    className="mb-8"
    animate={{
      y: [0, -20, 0],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-24 h-24 text-primary drop-shadow-lg"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  </motion.div>
);

const fallbackTexts = ["Are you sure?", "Really??", "Think again!", "You're breaking my heart :(", "Last chance!"];

export function Proposal() {
  const [noClickCount, setNoClickCount] = useState(0);
  const [yesButtonScale, setYesButtonScale] = useState(1);
  const [noButtonText, setNoButtonText] = useState("No");
  const [noButtonPosition, setNoButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const [isYesClicked, setIsYesClicked] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    if (window.innerWidth > 0 && window.innerHeight > 0) {
      setNoButtonPosition({
        top: window.innerHeight * 0.6,
        left: window.innerWidth / 2 + 100,
      });
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNoClick = () => {
    setNoButtonText(fallbackTexts[noClickCount % fallbackTexts.length]);
    setNoClickCount((prev) => prev + 1);
    setYesButtonScale((prev) => prev * 1.2);

    const newTop = Math.random() * (window.innerHeight - 150) + 50;
    const newLeft = Math.random() * (window.innerWidth - 200) + 50;
    setNoButtonPosition({ top: newTop, left: newLeft });
  };

  const handleYesClick = () => {
    setIsYesClicked(true);
  };

  if (!isClient) {
    return <div className="w-full max-w-2xl min-h-[400px]" />;
  }

  const proposalContent = (
    <>
      <BouncingHeart />
      <h1 className="text-4xl md:text-6xl font-headline text-center text-primary-foreground/90 mb-8">
        Will you be my Valentine?
      </h1>
      <motion.div animate={{ scale: yesButtonScale }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
        <Button
          size="lg"
          className="text-2xl px-8 py-6"
          onClick={handleYesClick}
        >
          Yes!
        </Button>
      </motion.div>
    </>
  );

  const celebrationContent = (
    <>
      <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center"
      >
        <h1 className="text-4xl md:text-6xl font-headline text-primary-foreground/90 mb-4">
          I knew you couldn't say no! ❤️
        </h1>
        <div className="w-64 h-64">
           <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
              <Ring />
            </Suspense>
        </div>
        <motion.p 
          className="text-lg md:text-xl font-body text-primary-foreground/80 mt-4 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          "With this ring, all my today and all my tomorrows are yours. Will you make me the happiest person alive?"
        </motion.p>
      </motion.div>
    </>
  );

  return (
    <Fragment>
      <motion.div
        className="relative w-full max-w-2xl p-8 md:p-12 rounded-3xl shadow-2xl bg-card/50 backdrop-blur-xl border border-card/20 flex flex-col items-center justify-center text-center"
        animate={isYesClicked ? { scale: [1, 1.02, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' } } : {}}
        style={{ minHeight: '400px' }}
      >
        {isYesClicked ? celebrationContent : proposalContent}
      </motion.div>

      <AnimatePresence>
        {!isYesClicked && noButtonPosition && (
          <motion.div
            key={noClickCount}
            className="absolute"
            initial={{ top: noButtonPosition.top, left: noButtonPosition.left, scale: 1, opacity: 1 }}
            animate={{ top: noButtonPosition.top, left: noButtonPosition.left }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
            transition={{ type: "spring", damping: 15, stiffness: 200, duration: 0.5 }}
          >
            <Button
              variant="destructive"
              size="lg"
              className="text-lg px-6 py-4 whitespace-nowrap"
              onClick={handleNoClick}
            >
              {noButtonText}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
}
