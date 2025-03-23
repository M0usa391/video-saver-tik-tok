
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export const DownloadForm = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [downloadedVideo, setDownloadedVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setLoading(false);
    setProgress(0);
    setDebugInfo(null);
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
    setDebugInfo(null);
    setDownloadedVideo(null);

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
      
      setDebugInfo(`محاولة الاتصال بـ: ${apiUrl}`);
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

      // Log the raw response for debugging
      setDebugInfo(`حالة الاستجابة: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("خطأ في الخادم:", errorText);
        setDebugInfo(prev => `${prev}\nخطأ في الخادم: ${response.status} ${response.statusText}\n${errorText}`);
        throw new Error(`خطأ في الخادم: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("بيانات الاستجابة:", data);
      setProgress(100);
      setDebugInfo(`نجاح: تم استلام معلومات الفيديو\nرابط التنزيل: ${data.downloadUrl}`);

      // Set the downloaded video URL
      if (data.downloadUrl) {
        setDownloadedVideo(data.downloadUrl);
        
        // Attempt to fetch the video as a blob to display it inline
        try {
          const videoResponse = await fetch(data.downloadUrl);
          const videoBlob = await videoResponse.blob();
          const videoUrl = URL.createObjectURL(videoBlob);
          setDownloadedVideo(videoUrl);
          
          toast({
            variant: "success",
            title: "تم التنزيل بنجاح",
            description: `تم تنزيل الفيديو "${data.title || data.filename}" بنجاح!`
          });
        } catch (videoError) {
          console.error("خطأ في تحميل الفيديو:", videoError);
          // If we can't fetch the video directly, just use the link for direct download
          window.location.href = data.downloadUrl;
          
          toast({
            variant: "info",
            title: "جاري التنزيل",
            description: "بدأ تنزيل الفيديو الآن."
          });
        }
      } else {
        setDebugInfo(`خطأ: لا يوجد رابط تنزيل في الاستجابة: ${JSON.stringify(data)}`);
        throw new Error("لم يتم استلام رابط التنزيل من الخادم");
      }
    } catch (error) {
      console.error("خطأ في التنزيل:", error);
      
      // More detailed error reporting
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDebugInfo(prev => `${prev}\nخطأ: ${errorMessage}`);
      
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
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin ml-2" />
              <span>جاري التنزيل... {progress.toFixed(0)}%</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 ml-2" />
              <span>تنزيل الفيديو</span>
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
        </motion.div>
      )}

      {downloadedVideo && (
        <motion.div
          className="mt-6 rounded-xl overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <video 
            ref={videoRef}
            src={downloadedVideo}
            controls
            autoPlay
            className="w-full h-auto rounded-xl"
            controlsList="nodownload"
          >
            فشل تحميل الفيديو، يمكنك <a href={downloadedVideo} download className="text-blue-500 underline">التنزيل المباشر</a>
          </video>
          <div className="mt-3 flex justify-center">
            <a 
              href={downloadedVideo} 
              download 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              حفظ الفيديو
            </a>
          </div>
        </motion.div>
      )}

      {debugInfo && (
        <motion.div
          className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap" dir="ltr">{debugInfo}</pre>
        </motion.div>
      )}

      <div className="flex justify-center mt-6 text-gray-600 dark:text-gray-400">
        <a 
          href="https://www.tiktok.com/@m0usa_0mar" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span className="mx-1">@m0usa_0mar</span>
          <span>تابعني على تيك توك</span>
        </a>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4" dir="rtl">
        باستخدام خدمتنا ، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا
      </p>
    </motion.div>
  );
};
