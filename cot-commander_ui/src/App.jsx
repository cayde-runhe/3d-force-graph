import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PlanViewer from './pages/PlanViewer';
import SimpleGraph from './components/SimpleGraph';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plan-viewer" element={<PlanViewer />} />
        <Route path="/simple" element={<SimpleGraph />} />
      </Routes>
    </BrowserRouter>
  );
}
