
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Admin from "./pages/Admin";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminFiles from "./pages/admin/AdminFiles";
import AdminContent from "./pages/admin/AdminContent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/admin" element={<Admin />}>
            <Route path="blog" element={<AdminBlog />} />
            <Route path="files" element={<AdminFiles />} />
            <Route path="content" element={<AdminContent />} />
          </Route>
          {/* Legal pages - placeholder routes */}
          <Route path="/terms" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Terms of Service</h1><p>Terms of Service content will be displayed here.</p></div></div>} />
          <Route path="/privacy" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Privacy Policy</h1><p>Privacy Policy content will be displayed here.</p></div></div>} />
          <Route path="/cookies" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Cookies Policy</h1><p>Cookies Policy content will be displayed here.</p></div></div>} />
          <Route path="/contact" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Contact Us</h1><p>Contact information and form will be displayed here.</p></div></div>} />
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
