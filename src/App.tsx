import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import MobileLayout from './components/layout/MobileLayout';

import BuzzFeed from './features/buzz/BuzzFeed';

const MapScreen = () => <div className="p-4">Map Screen</div>;
const LeagueScreen = () => <div className="p-4">League Screen</div>;
const MoreScreen = () => <div className="p-4">More Screen</div>;


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MobileLayout>
          <Routes>
            <Route path="/" element={<BuzzFeed />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/league" element={<LeagueScreen />} />
            <Route path="/more" element={<MoreScreen />} />
          </Routes>
        </MobileLayout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;