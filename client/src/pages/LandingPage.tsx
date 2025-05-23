import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AudioUploader from "@/components/AudioUploader";
import { Button } from "@/components/ui/button";
import { AudioWaveform, ChartBar, Check, Info } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleFileUpload = (
    file: File,
    result: { isQueenPresent: boolean; confidence: number }
  ) => {
    // Store the result in localStorage for the results page
    localStorage.setItem(
      "analysisResult",
      JSON.stringify({
        isQueenPresent: result.isQueenPresent,
        confidence: result.confidence,
        fileName: file.name,
      })
    );

    // Navigate to results page
    navigate("/results");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <section className="w-full min-h-[calc(100vh-5rem)] bg-gradient-to-br from-honey-light to-white flex flex-col md:flex-row items-center justify-center px-6 md:px-12 overflow-hidden relative">
          {/* Image Section */}
          <div className="w-full md:w-1/2 relative mb-12 md:mb-0">
            <img
              src="/hive.png"
              alt="Queen Bee"
              className="w-full max-w-md mx-auto md:absolute md:left-[-100px] md:top-1/2 md:transform md:-translate-y-1/2"
            />
          </div>

          {/* Text Content */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hive">
              AI-Powered <span className="text-honey">Queen Bee</span> Detection
            </h1>
            <p className="mt-6 text-lg md:text-xl text-hive-light max-w-xl mx-auto md:mx-0">
              BuzzDetect uses advanced machine learning algorithms to analyze
              hive audio recordings and detect the presence of a queen bee with
              high accuracy.
            </p>
            <div className="mt-10">
              <Button
                onClick={() =>
                  document
                    .getElementById("upload-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-honey hover:bg-honey-dark text-white px-8 py-6 text-lg rounded-full"
              >
                Try It Now
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features-section"
          className="w-full py-20 px-6 md:px-12 bg-white"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-honey-light/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-honey rounded-full flex items-center justify-center mx-auto mb-4">
                  <AudioWaveform className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-hive mb-2">
                  Audio Analysis
                </h3>
                <p className="text-hive-light">
                  Advanced audio processing to detect queen bee presence
                </p>
              </div>

              <div className="bg-honey-light/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-honey rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBar className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-hive mb-2">
                  Real-time Results
                </h3>
                <p className="text-hive-light">
                  Get instant analysis with detailed confidence scores
                </p>
              </div>

              <div className="bg-honey-light/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-honey rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-hive mb-2">
                  High Accuracy
                </h3>
                <p className="text-hive-light">
                  Machine learning model trained on extensive bee audio data
                </p>
              </div>
            </div>
            <div id="upload-section">
              <AudioUploader onFileUpload={handleFileUpload} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
