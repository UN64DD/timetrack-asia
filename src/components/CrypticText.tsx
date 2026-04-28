/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';

interface CrypticTextProps {
  text: string;
}

export default function CrypticText({ text }: CrypticTextProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={text}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="inline-block"
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}
