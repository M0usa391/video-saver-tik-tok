
import { motion } from "framer-motion";
import { Clipboard, ArrowRight, Download, Check } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: <Clipboard className="h-6 w-6" />,
      title: "Copy link",
      description: "Copy the link of the TikTok video you want to download"
    },
    {
      icon: <ArrowRight className="h-6 w-6" />,
      title: "Paste link",
      description: "Paste the link in the input field above"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Download",
      description: "Click the download button and save the video to your device"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple 3-step process</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Downloading your favorite TikTok videos has never been easier. Just follow these simple steps.
          </p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start space-y-8 md:space-y-0 md:space-x-6">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="relative flex flex-col items-center text-center max-w-xs"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className="relative">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
