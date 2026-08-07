import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const offsets = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: -40 },
  right: { x: 40 },
};

const ScrollReveal = ({
  children,
  delay = 0,
  duration = 0.7,
  direction = 'up',
  className = '',
}: ScrollRevealProps) => (
  <motion.div
    initial={{ opacity: 0, ...offsets[direction] }}
    whileInView={{ opacity: 1, x: 0, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default ScrollReveal;
