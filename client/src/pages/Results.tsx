import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ResultDisplay from "@/components/ResultDisplay";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const Results = () => {
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState<{
    isQueenPresent: boolean | null;
    confidence: number | null;
    fileName: string;
    featurePlot: string;
  } | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem("analysisResult");
    if (!storedResult) {
      navigate("/"); // Redirect to home if no results
      return;
    }
    setAnalysisResult(JSON.parse(storedResult));
  }, [navigate]);

  const handleNewAnalysis = () => {
    localStorage.removeItem("analysisResult");
    navigate("/");
  };

  if (!analysisResult) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20 pb-12 px-6 bg-gradient-to-br from-honey-light to-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-hive mb-2">
              Analysis Results
            </h1>
            <p className="text-hive-light">{analysisResult.fileName}</p>
          </div>

          <img
            src="/hive2.png"
            alt="Queen Bee"
            className="hidden md:block w-[20rem] absolute left-[-30px] top-[10rem]"
          />
          <div className="relative">
            <div className="space-y-12">
              <ResultDisplay
                isQueenPresent={analysisResult.isQueenPresent}
                confidence={analysisResult.confidence}
              />

              {analysisResult.featurePlot && (
                <div className="mt-8 bg-white rounded-lg shadow-lg p-4 md:p-6">
                  <h2 className="text-2xl font-bold text-hive mb-6">
                    Audio Analysis Visualization
                  </h2>
                  <div className="w-full overflow-x-auto">
                    <img
                      src={analysisResult.featurePlot}
                      alt="Audio Feature Analysis"
                      className="w-full max-w-4xl mx-auto"
                    />
                  </div>
                </div>
              )}

              <div className="text-center pt-8">
                <Button
                  variant="ghost"
                  onClick={handleNewAnalysis}
                  className="flex items-center gap-2 px-8 py-4 bg-honey text-white rounded-full hover:bg-honey-dark transition-colors"
                >
                  <ArrowLeft size={20} />
                  New Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
