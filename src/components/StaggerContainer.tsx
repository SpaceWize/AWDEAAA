import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

export const staggerChild = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const StaggerContainer = ({
  children,
  delay = 0,
  staggerDelay = 0.12,
  className = '',
}: StaggerContainerProps) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-100px' }}
    variants={{
      hidden: {},
      visible: {
        transition: { staggerChildren: staggerDelay, delayChildren: delay },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default StaggerContainer;
