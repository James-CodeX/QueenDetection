import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast"; // using 'sonner' for toast
import { Upload, AudioWaveform, Loader2 } from "lucide-react";
import ClassifierSelectionDialog from "./ClassifierSelectionDialog";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "./AuthDialog";

const API_URI = import.meta.env.VITE_API_URI;

interface AudioUploaderProps {
  onFileUpload: (
    file: File,
    classifier: "random-forest" | "cnn",
    result: { 
      isQueenPresent: boolean; 
      confidence: number;
      featurePlot?: string;
    }
  ) => void;
}

const AudioUploader = ({ onFileUpload }: AudioUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleUploadClick = () => {
    if (!user) {
      toast.error("Please sign in to upload audio files");
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!user) {
      toast.error("Please sign in to upload audio files");
      return;
    }
    if (file.type === "audio/wav" || file.name.endsWith(".wav")) {
      setSelectedFile(file);
      toast.success("Audio file selected successfully!");
    } else {
      toast.error("Please upload a .wav audio file only.");
    }
  };

  const handleClassifierSelect = async (classifier: "random-forest" | "cnn") => {
    if (!selectedFile) {
      toast.error("Please select a file first!");
      return;
    }

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("audio_file", selectedFile);

      const endpoint = classifier === "random-forest" ? "/predict" : "/predict/cnn";
      const response = await fetch(`${API_URI}/api${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze audio");
      }

      const result = await response.json();
      const isQueenPresent = result.prediction === "Queen Bee is Present";
      const confidence = parseFloat(result.confidence) / 100;

      // Call the parent handler with the result including feature plot
      onFileUpload(selectedFile, classifier, {
        isQueenPresent,
        confidence,
        featurePlot: result.feature_plot
      });

    } catch (error) {
      toast.error("Failed to analyze audio. Please try again.");
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {!user ? (
        <div className="text-center p-8 border-2 border-dashed rounded-lg border-gray-300">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-honey/20 flex items-center justify-center">
              <AudioWaveform size={32} className="text-honey" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-hive">
                Sign in to Upload Audio
              </p>
              <p className="text-sm text-hive-light">
                Create an account or sign in to analyze your hive audio
              </p>
            </div>
            <AuthDialog>
              <Button className="bg-honey hover:bg-honey-dark text-white">
                Sign In
              </Button>
            </AuthDialog>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
              isDragging
                ? "border-honey bg-honey/10"
                : selectedFile
                ? "border-nature bg-nature/5"
                : "border-gray-300"
            } transition-all`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".wav"
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-nature/20 flex items-center justify-center">
                  <AudioWaveform size={32} className="text-nature" />
                </div>
                <div>
                  <p className="text-lg font-medium text-hive">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-hive-light">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-honey/20 flex items-center justify-center">
                  <Upload size={28} className="text-honey" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium text-hive">
                    Drag & drop your audio file
                  </p>
                  <p className="text-sm text-hive-light">
                    or click to select from your device (.wav files only)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <ClassifierSelectionDialog onClassifierSelect={handleClassifierSelect}>
              <Button
                disabled={!selectedFile || isAnalyzing}
                className="w-full bg-honey hover:bg-honey-dark text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Audio Sample"
                )}
              </Button>
            </ClassifierSelectionDialog>
          </div>
        </>
      )}
    </div>
  );
};

export default AudioUploader;
