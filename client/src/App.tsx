import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Index from "./pages/LandingPage";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import AudioUploader from '@/components/AudioUploader';
import ScrollToTop from '@/components/ScrollToTop';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Results />} />
          <Route path="/upload" element={<AudioUploader onFileUpload={() => {}} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
