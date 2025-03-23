
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Download, Edit, Loader2, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Interface for download history items
interface HistoryItem {
  url: string;
  downloadUrl: string;
  name: string;
  date: string;
}

export const DownloadForm = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [downloadedVideo, setDownloadedVideo] = useState<string | null>(null);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const { toast } = useToast();
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("downloadHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("خطأ في تحميل سجل التنزيلات:", error);
        localStorage.removeItem("downloadHistory");
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("downloadHistory", JSON.stringify(history));
  }, [history]);

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
        
        // Add to history
        const now = new Date();
        const dateStr = now.toLocaleDateString('ar-EG');
        const timeStr = now.toLocaleTimeString('ar-EG');
        const newHistoryItem: HistoryItem = {
          url: url,
          downloadUrl: data.downloadUrl,
          name: `فيديو TikTok - ${dateStr} ${timeStr}`,
          date: `${dateStr} ${timeStr}`
        };
        
        setHistory(prev => [newHistoryItem, ...prev.slice(0, 19)]); // Keep last 20 items max
        
        toast({
          variant: "success",
          title: "تم العثور على الفيديو بنجاح",
          description: "يمكنك الآن تنزيل الفيديو من خلال الرابط أدناه"
        });
        
        // Automatically trigger download after a short delay
        setTimeout(() => {
          if (downloadLinkRef.current) {
            downloadLinkRef.current.click();
          }
        }, 1000);
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

  // Function to download the video
  const downloadVideo = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'tiktok-video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Function to handle renaming a history item
  const handleRename = (index: number) => {
    if (editName.trim()) {
      const updatedHistory = [...history];
      updatedHistory[index].name = editName;
      setHistory(updatedHistory);
      setEditingItem(null);
      setEditName("");
      
      toast({
        variant: "success",
        title: "تم تغيير الاسم",
        description: "تم تحديث اسم الفيديو بنجاح"
      });
    }
  };

  // Function to remove item from history
  const removeHistoryItem = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
    toast({
      variant: "default",
      title: "تم الحذف",
      description: "تم حذف الفيديو من السجل"
    });
  };

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
              <span>جاري البحث عن الفيديو...</span>
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
            
            <div className="flex justify-center mb-4">
              <Button 
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center"
                onClick={() => {
                  if (downloadedVideo) {
                    downloadVideo(downloadedVideo, 'tiktok-video.mp4');
                  }
                }}
              >
                <Download className="h-5 w-5 ml-2" />
                <span>تنزيل الفيديو الآن</span>
              </Button>
              <a 
                ref={downloadLinkRef}
                href={downloadedVideo} 
                download="tiktok-video.mp4"
                className="hidden"
              >
                تنزيل
              </a>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              يمكنك الضغط على الزر أعلاه لتنزيل الفيديو مباشرة على جهازك
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        <ToggleGroup 
          type="single" 
          value={showHistory ? "history" : "hidden"} 
          onValueChange={(value) => {
            if (value) setShowHistory(value === "history");
          }}
          className="relative z-10"
        >
          <ToggleGroupItem value="history" className="w-full">
            {showHistory ? "إخفاء سجل التنزيلات" : "عرض سجل التنزيلات"}
          </ToggleGroupItem>
        </ToggleGroup>
        
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              {history.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                  لا توجد تنزيلات سابقة
                </p>
              ) : (
                <ul className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thin">
                  {history.map((item, index) => (
                    <li key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between">
                        {editingItem === index ? (
                          <div className="flex-1 flex items-center">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="text-sm"
                              placeholder="أدخل اسمًا جديدًا"
                              autoFocus
                            />
                            <div className="flex shrink-0 mr-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleRename(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setEditingItem(null)}
                                className="h-8 w-8 p-0"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{item.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.date}</p>
                            </div>
                            <div className="flex">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => {
                                  setEditingItem(index);
                                  setEditName(item.name);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeHistoryItem(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <Button 
                          variant="link" 
                          className="text-xs text-blue-600 dark:text-blue-400 p-0 h-auto hover:underline"
                          onClick={() => {
                            if (item.downloadUrl) {
                              downloadVideo(item.downloadUrl, `${item.name}.mp4`);
                            }
                          }}
                        >
                          تنزيل الفيديو مرة أخرى
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-8">
        <motion.a 
          href="https://www.tiktok.com/@m0usa_0mar" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all"
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
