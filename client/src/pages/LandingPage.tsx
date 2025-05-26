import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AudioUploader from "@/components/AudioUploader";
import { Button } from "@/components/ui/button";
import {
  AudioWaveform,
  ChartBar,
  Check,
  Info,
  Brain,
  TreePine,
  Target,
  Zap,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleFileUpload = (
    file: File,
    classifier: "random-forest" | "cnn",
    result: { 
      isQueenPresent: boolean; 
      confidence: number;
      featurePlot?: string;
    }
  ) => {
    // Store the result in localStorage for the results page
    localStorage.setItem(
      "analysisResult",
      JSON.stringify({
        isQueenPresent: result.isQueenPresent,
        confidence: result.confidence,
        fileName: file.name,
        classifier: classifier,
        featurePlot: result.featurePlot
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
        <section id="features-section" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-hive mb-12">
              How <span className="text-honey">BuzzDetect</span> Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-honey/10 text-center">
                <div className="w-16 h-16 mx-auto bg-honey/10 rounded-full flex items-center justify-center mb-4">
                  <AudioWaveform size={32} className="text-honey" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-hive">
                  Audio Analysis
                </h3>
                <p className="text-hive-light">
                  Extract acoustic features like MFCCs and spectral
                  characteristics from hive recordings.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg border border-honey/10 text-center">
                <div className="w-16 h-16 mx-auto bg-honey/10 rounded-full flex items-center justify-center mb-4">
                  <ChartBar size={32} className="text-honey" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-hive">
                  ML Classification
                </h3>
                <p className="text-hive-light">
                  Our trained models process the acoustic data to identify queen
                  bee patterns.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg border border-honey/10 text-center">
                <div className="w-16 h-16 mx-auto bg-honey/10 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-honey" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-hive">
                  Accurate Results
                </h3>
                <p className="text-hive-light">
                  Get clear insights about queen bee presence with visual data
                  representations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Models Section */}
        <section id="ai-models-section" className="py-16 px-6 bg-gradient-to-br from-white to-honey-light">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-hive mb-6">
              Choose Your <span className="text-honey">AI Model</span>
            </h2>
            <p className="text-lg text-center text-hive-light mb-12 max-w-3xl mx-auto">
              BuzzDetect offers two powerful machine learning approaches for
              queen bee detection. Choose the model that best fits your needs.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Random Forest Section */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-nature/20">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-nature/20 flex items-center justify-center mr-4">
                    <TreePine size={32} className="text-nature" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-hive">
                      Random Forest Classifier
                    </h3>
                    <p className="text-nature font-medium">
                      Traditional Machine Learning
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Target
                      size={20}
                      className="text-nature mt-1 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-hive">
                        High Interpretability
                      </h4>
                      <p className="text-sm text-hive-light">
                        Understand exactly which acoustic features contribute to
                        the decision
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Zap size={20} className="text-nature mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-hive">
                        Fast Processing
                      </h4>
                      <p className="text-sm text-hive-light">
                        Quick analysis with lower computational requirements
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Check
                      size={20}
                      className="text-nature mt-1 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-hive">
                        Proven Reliability
                      </h4>
                      <p className="text-sm text-hive-light">
                        Ensemble method that reduces overfitting and provides
                        stable results
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-nature/10 rounded-lg">
                  <h5 className="font-semibold text-hive mb-2">Best For:</h5>
                  <p className="text-sm text-hive-light">
                    Users who want transparent, explainable results and faster
                    processing times. Ideal for research applications where
                    understanding feature importance is crucial.
                  </p>
                </div>
              </div>

              {/* CNN Section */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-honey/20">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-honey/20 flex items-center justify-center mr-4">
                    <Brain size={32} className="text-honey" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-hive">
                      Convolutional Neural Network
                    </h3>
                    <p className="text-honey font-medium">Deep Learning AI</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Brain
                      size={20}
                      className="text-honey mt-1 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-hive">
                        Deep Pattern Recognition
                      </h4>
                      <p className="text-sm text-hive-light">
                        Automatically learns complex acoustic patterns and
                        relationships
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Target
                      size={20}
                      className="text-honey mt-1 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-hive">
                        Superior Accuracy
                      </h4>
                      <p className="text-sm text-hive-light">
                        Advanced neural networks for potentially higher
                        detection precision
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <AudioWaveform
                      size={20}
                      className="text-honey mt-1 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-hive">
                        Spectral Analysis
                      </h4>
                      <p className="text-sm text-hive-light">
                        Processes raw spectrogram data to identify subtle audio
                        signatures
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-honey/10 rounded-lg">
                  <h5 className="font-semibold text-hive mb-2">Best For:</h5>
                  <p className="text-sm text-hive-light">
                    Users seeking the highest possible accuracy and don't mind
                    longer processing times. Perfect for production environments
                    where precision is paramount.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="inline-block p-6 bg-white/80 rounded-lg border border-honey/20">
                <Info size={24} className="text-honey mx-auto mb-2" />
                <p className="text-sm text-hive-light max-w-2xl">
                  <strong>Not sure which to choose?</strong> Random Forest is
                  great for quick, interpretable results, while CNN offers
                  cutting-edge accuracy. You can try both and compare the
                  results!
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="upload-section" className="py-20 bg-white px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-hive mb-6">
              Upload Hive Audio
            </h2>
            <p className="text-hive-light mb-8 text-lg">
              Upload a .wav file of your hive's audio and let BuzzDetect analyze
              it for queen bee presence.
            </p>

            <AudioUploader onFileUpload={handleFileUpload} />
            <div className="mt-8 p-4 bg-white/50 rounded-lg border border-honey/20 inline-block">
              <div className="flex items-center text-left">
                <Info size={20} className="text-honey mr-2 flex-shrink-0" />
                <p className="text-sm text-hive-light">
                  For optimal results, recordings should be 10-30 seconds in
                  length, taken from near the center of the hive with minimal
                  external noise.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
