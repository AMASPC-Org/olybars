import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import MobileLayout from './components/layout/MobileLayout';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import LeaguePage from './pages/LeaguePage';
import MorePage from './pages/MorePage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MobileLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/league" element={<LeaguePage />} />
            <Route path="/more" element={<MorePage />} />
          </Routes>
        </MobileLayout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
