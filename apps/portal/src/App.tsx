import { Routes, Route, Navigate } from "react-router-dom";
import { PortalSelectionPage } from "@man-u-ai/web-core";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PortalSelectionPage />} />
      <Route path="/portal" element={<PortalSelectionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
