import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RateInputPage from "./pages/RateInput";
import LiveDisplayPage from "./pages/LiveDisplayPage";
import FormDisplay from "./pages/FormDisplay";
import LeadFormPage from "./pages/LeadFormPage";
import SchedulePage from "./pages/SchedulePage";
import HostPage from "./pages/HostPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<LeadFormPage />} />
          <Route path="/rate" element={<RateInputPage />} />
          <Route path="/display" element={<LiveDisplayPage />} />
          <Route path="/formdisplay" element={<FormDisplay />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/host" element={<HostPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
