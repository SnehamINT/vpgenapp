
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VPGenApp from './pages/VPGenApp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<VPGenApp />} />
  
    </Routes>
  );
}

export default App;
