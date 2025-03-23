
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Download, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export const DownloadForm = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [downloadedVideo, setDownloadedVideo] = useState<string | null>(null);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setLoading(false);
    setProgress(0);
    setDownloadStarted(false);
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال رابط فيديو TikTok"
      });
      return;
    }

    if (!url.includes("tiktok.com")) {
      toast({
        variant: "destructive",
        title: "رابط غير صالح",
        description: "الرجاء إدخال رابط TikTok صالح"
      });
      return;
    }

    setLoading(true);
    setProgress(0);
    setDownloadedVideo(null);
    setDownloadStarted(false);

    // Create a controller to be able to abort the fetch if needed
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      // Simulate progress for better user experience
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 3;
          return newProgress > 75 ? 75 : newProgress;
        });
      }, 500);

      const apiUrl = "https://tiktok-da.onrender.com/download";
      
      console.log("إرسال طلب إلى الخادم:", url, "عنوان API:", apiUrl);
      
      // Make the API call to your render.com backend
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("خطأ في الخادم:", errorText);
        throw new Error(`خطأ في الخادم: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("بيانات الاستجابة:", data);
      setProgress(100);

      // Set the downloaded video URL
      if (data.downloadUrl) {
        setDownloadedVideo(data.downloadUrl);
        setDownloadStarted(true);
        
        toast({
          variant: "success",
          title: "تم العثور على الفيديو بنجاح",
          description: "يمكنك الآن تنزيل الفيديو من خلال الزر أدناه"
        });
      } else {
        throw new Error("لم يتم استلام رابط التنزيل من الخادم");
      }
    } catch (error) {
      console.error("خطأ في التنزيل:", error);
      
      // More detailed error reporting
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if ((error as Error).name === 'AbortError') {
        toast({
          variant: "destructive",
          title: "انتهت مهلة الطلب",
          description: "انتهت مهلة طلب التنزيل. قد يكون الخادم مشغولاً، يرجى المحاولة مرة أخرى لاحقًا."
        });
      } else if (retryCount < 1) { // Only retry once
        // Retry logic
        setRetryCount(prev => prev + 1);
        toast({
          variant: "warning",
          title: "مشكلة في الاتصال",
          description: `تم اكتشاف مشكلة في الاتصال. إعادة المحاولة... (${retryCount + 1}/2)`
        });
        
        // Small delay before retry
        setTimeout(() => {
          handleDownload(e);
        }, 3000);
        return;
      } else {
        toast({
          variant: "destructive",
          title: "فشل التنزيل",
          description: "فشل تنزيل الفيديو. قد يكون الخادم متوقفًا أو يواجه حركة مرور عالية. يرجى المحاولة مرة أخرى لاحقًا."
        });
      }
    } finally {
      clearTimeout(timeoutId);
      if (retryCount >= 1) {
        resetState();
        setRetryCount(0);
      } else {
        setLoading(false);
      }
    }
  };

  // Function to handle direct download
  const initiateDownload = () => {
    if (downloadedVideo) {
      // Create an invisible anchor element
      const a = document.createElement('a');
      a.href = downloadedVideo;
      a.download = 'tiktok-video.mp4'; // Default filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        variant: "success",
        title: "جاري التنزيل",
        description: "بدأ تنزيل الفيديو على جهازك"
      });
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (downloadedVideo && downloadedVideo.startsWith('blob:')) {
        URL.revokeObjectURL(downloadedVideo);
      }
    };
  }, [downloadedVideo]);

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <form onSubmit={handleDownload} className="space-y-4">
        <div className="relative">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="الصق رابط فيديو TikTok هنا..."
            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-14 pl-4 pr-12 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-right"
            dir="rtl"
            disabled={loading}
          />
          {url && (
            <motion.button
              type="button"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setUrl("")}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-14 rounded-xl font-medium text-base bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin ml-2" />
              <span>جاري البحث عن الفيديو... {progress.toFixed(0)}%</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Download className="h-5 w-5 ml-2" />
              <span>البحث عن الفيديو</span>
            </div>
          )}
        </Button>
      </form>

      {loading && (
        <motion.div 
          className="mt-4 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Progress value={progress} className="h-2" />
          
          <div className="mt-4 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">جاري الاتصال بالخادم...</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {downloadStarted && downloadedVideo && (
          <motion.div
            className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-4 text-green-500">
              <Check className="h-6 w-6 mr-2" />
              <p className="font-medium">تم العثور على الفيديو بنجاح!</p>
            </div>
            
            <Button
              onClick={initiateDownload}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl shadow-md transition-all"
            >
              <Download className="h-5 w-5 ml-2" />
              <span>تنزيل الفيديو</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center mt-8">
        <motion.a 
          href="https://www.tiktok.com/@m0usa_0mar" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-md hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-white font-medium">تابعني على تيك توك</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mr-2 text-white">
            <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"/>
          </svg>
          <span className="text-white font-bold mr-1">@m0usa_0mar</span>
        </motion.a>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6" dir="rtl">
        باستخدام خدمتنا، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا
      </p>
    </motion.div>
  );
};
