
import { motion } from "framer-motion";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 py-12" dir="rtl">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div 
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-md" />
                <div className="absolute inset-0.5 bg-white dark:bg-black rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500">
                    <path d="m4 17 6-6-6-6" />
                    <path d="m12 17 6-6-6-6" />
                  </svg>
                </div>
              </div>
              <span className="font-medium text-lg tracking-tight mr-2">تيك سيف</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              أسهل طريقة لتنزيل وحفظ مقاطع فيديو تيك توك المفضلة لديك بدون علامة مائية وبجودة عالية.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-semibold uppercase text-gray-900 dark:text-white mb-4">إرشادات الاستخدام</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">انسخ رابط الفيديو من تطبيق تيك توك</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">الصق الرابط في المربع أعلاه</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">انقر على زر البحث عن الفيديو</a></li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold uppercase text-gray-900 dark:text-white mb-4">معلومات قانونية</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">شروط الاستخدام</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">إخلاء المسؤولية</a></li>
            </ul>
          </motion.div>
        </div>
        
        <hr className="border-gray-200 dark:border-gray-800 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.p 
            className="text-gray-600 dark:text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            © {currentYear} تيك سيف. جميع الحقوق محفوظة.
          </motion.p>
          
          <motion.div 
            className="flex space-x-6 mt-4 md:mt-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <a href="https://www.tiktok.com/@m0usa_0mar" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <span className="sr-only">TikTok</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="h-5 w-5">
                <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"/>
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
