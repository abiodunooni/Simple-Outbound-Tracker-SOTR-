import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Leads } from "./pages/Leads";
import { LeadDetail } from "./pages/LeadDetail";
import { CallHistory } from "./pages/CallHistory";
import { Analytics } from "./pages/Analytics";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  return (
    <SidebarProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="calls" element={<CallHistory />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
      <Toaster />
    </SidebarProvider>
  );
}

export default App;
