
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
  return (
    <motion.div 
      className="border-b border-gray-200 dark:border-gray-800 py-5"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={onClick}
      >
        <h3 className="text-lg font-medium">{question}</h3>
        <ChevronDown className={cn(
          "h-5 w-5 text-gray-500 transition-transform duration-300",
          isOpen && "transform rotate-180"
        )} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-gray-600 dark:text-gray-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const faqItems = [
    {
      question: "Is this service completely free?",
      answer: "Yes, our TikTok video downloader service is completely free to use with no hidden charges."
    },
    {
      question: "Can I download videos without watermark?",
      answer: "Yes, our service removes the TikTok watermark from downloaded videos whenever possible."
    },
    {
      question: "Is there a limit to how many videos I can download?",
      answer: "No, there are no limits to the number of videos you can download. However, we ask that you use our service responsibly."
    },
    {
      question: "What formats are the videos downloaded in?",
      answer: "Videos are downloaded in MP4 format, which is compatible with most devices and media players."
    },
    {
      question: "Is it legal to download TikTok videos?",
      answer: "Downloading videos for personal use is generally acceptable. However, you should respect copyright and intellectual property rights. Never claim others' content as your own or use it commercially without permission."
    }
  ];

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get answers to the most common questions about our TikTok video downloader.
          </p>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <FAQItem 
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
