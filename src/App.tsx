import React from 'react';
import './global.css'; // Ensure you have a global CSS file for styles
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BoardViewPage from './pages/BoardViewPage';
import BoardDetailPage from './pages/BoardDetailPage';

// import MainLayout from './layouts/MainLayout'; // Optional: For consistent nav/footer

function App() {
  return (
    <Router>
      {/* <MainLayout> */}
        <Routes>
          <Route path="/boards" element={<BoardViewPage />} />
          <Route path="/board/:boardId" element={<BoardDetailPage />} />
          <Route path="*" element={<Navigate to="/boards" replace />} />
        </Routes>
      {/* </MainLayout> */}
    </Router>
  );
}

export default App;