import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import IntentUnderstanding from './pages/nodes/IntentUnderstanding';
import SituationAssessment from './pages/nodes/SituationAssessment';
import ConceptFormation from './pages/nodes/ConceptFormation';
import PlanDevelopment from './pages/nodes/PlanDevelopment';
import SimulationTrial from './pages/nodes/SimulationTrial';
import EffectEvaluation from './pages/nodes/EffectEvaluation';
import SimulationRun from './pages/SimulationRun';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
        </Route>
        <Route path="/nodes/intent-understanding" element={<IntentUnderstanding />} />
        <Route path="/nodes/situation-assessment" element={<SituationAssessment />} />
        <Route path="/nodes/concept-formation" element={<ConceptFormation />} />
        <Route path="/nodes/plan-development" element={<PlanDevelopment />} />
        <Route path="/nodes/simulation-trial" element={<SimulationTrial />} />
        <Route path="/nodes/effect-evaluation" element={<EffectEvaluation />} />
        <Route path="/simulation-run" element={<SimulationRun />} />
      </Routes>
    </BrowserRouter>
  );
}
