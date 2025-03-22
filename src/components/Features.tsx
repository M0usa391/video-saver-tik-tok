
import { motion } from "framer-motion";
import { Shield, Zap, Download, Sparkles } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      title: "Fast & Reliable",
      description: "Download TikTok videos in seconds with our high-speed servers"
    },
    {
      icon: <Download className="h-6 w-6 text-blue-500" />,
      title: "High Quality",
      description: "Get the best possible video quality without watermarks"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      title: "Secure & Private",
      description: "Your data is never stored on our servers and all connections are encrypted"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-blue-500" />,
      title: "Easy to Use",
      description: "Simple interface that works on all devices - desktop, tablet, and mobile"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our TikTok downloader offers everything you need to save your favorite TikTok videos quickly and easily.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="glass p-8 rounded-2xl shadow-sm hover:shadow-md transition-all"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl inline-block mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
