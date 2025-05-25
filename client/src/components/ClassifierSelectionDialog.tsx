import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, TreePine } from "lucide-react";

interface ClassifierSelectionDialogProps {
  children: React.ReactNode;
  onClassifierSelect: (classifier: "random-forest" | "cnn") => void;
}

const ClassifierSelectionDialog = ({
  children,
  onClassifierSelect,
}: ClassifierSelectionDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (classifier: "random-forest" | "cnn") => {
    onClassifierSelect(classifier);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Analysis Method</DialogTitle>
          <DialogDescription>
            Choose which machine learning model to use for analyzing your audio
            sample.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <Card
            className="p-4 cursor-pointer border-2 hover:border-honey transition-colors"
            onClick={() => handleSelect("random-forest")}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-nature/20 flex items-center justify-center">
                <TreePine size={24} className="text-nature" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-hive">
                  Random Forest Classifier
                </h3>
                <p className="text-sm text-hive-light">
                  Traditional ensemble method with high interpretability
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer border-2 hover:border-honey transition-colors"
            onClick={() => handleSelect("cnn")}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-honey/20 flex items-center justify-center">
                <Brain size={24} className="text-honey" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-hive">
                  CNN (Convolutional Neural Network)
                </h3>
                <p className="text-sm text-hive-light">
                  Deep learning approach for complex pattern recognition
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassifierSelectionDialog;
