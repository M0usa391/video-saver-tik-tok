
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const DownloadForm = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const resetState = () => {
    setLoading(false);
    setProgress(0);
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a TikTok URL");
      return;
    }

    if (!url.includes("tiktok.com")) {
      toast.error("Please enter a valid TikTok URL");
      return;
    }

    setLoading(true);
    setProgress(0);

    // Create a controller to be able to abort the fetch if needed
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Simulate progress for better user experience
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 85 ? 85 : newProgress;
        });
      }, 500);

      console.log("Sending request to backend:", url);
      
      // Make the API call to your render.com backend
      const response = await fetch("https://tiktok-da.onrender.com/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      clearInterval(progressInterval);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      setProgress(100);

      // Create a download link for the video
      if (data.downloadUrl) {
        const a = document.createElement("a");
        a.href = data.downloadUrl;
        a.download = data.filename || "tiktok-video.mp4";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast.success("Video downloaded successfully!");
      } else {
        throw new Error("No download URL received from server");
      }
    } catch (error) {
      console.error("Download error:", error);
      
      if ((error as Error).name === 'AbortError') {
        toast.error("Download request timed out. The server might be busy, please try again later.");
      } else if (retryCount < 2) {
        // Retry logic
        setRetryCount(prev => prev + 1);
        toast.warning("Connection issue detected. Retrying...");
        
        // Small delay before retry
        setTimeout(() => {
          handleDownload(e);
        }, 2000);
        return;
      } else {
        toast.error("Failed to download video. The server might be down or experiencing high traffic.");
      }
    } finally {
      clearTimeout(timeoutId);
      resetState();
      setRetryCount(0);
    }
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
            placeholder="Paste TikTok video URL here..."
            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-14 pl-4 pr-12 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {url && (
            <motion.button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Downloading... {progress.toFixed(0)}%</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Download Video</span>
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

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        By using our service, you agree to our Terms of Service and Privacy Policy
      </p>
    </motion.div>
  );
};
