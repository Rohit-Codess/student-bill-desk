import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StudentsPage from './pages/StudentsPage';
import FeeTypesPage from './pages/FeeTypesPage';
import GenerateFeesPage from './pages/GenerateFeesPage';
import AssignmentsPage from './pages/AssignmentsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="fee-types" element={<FeeTypesPage />} />
          <Route path="generate-fees" element={<GenerateFeesPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
