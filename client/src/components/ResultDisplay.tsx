import { Card } from "@/components/ui/card";

interface ResultDisplayProps {
  isQueenPresent: boolean | null;
  confidence: number | null;
}

const ResultDisplay = ({ isQueenPresent, confidence }: ResultDisplayProps) => {
  if (isQueenPresent === null) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8 bg-white border-2 border-honey/20">
        <div className="text-center ">
          <h2 className="text-2xl font-bold text-hive mb-6">
            Detection Result
          </h2>
          
          <div className={`text-3xl font-bold mb-6 ${
            isQueenPresent ? 'text-nature' : 'text-destructive'
          }`}>
            Queen Bee is {isQueenPresent ? 'Present' : 'Not Detected'}
          </div>
          
          {confidence !== null && (
            <div className="text-xl text-hive-light">
              Confidence: {Math.round(confidence * 100)}%
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResultDisplay;
