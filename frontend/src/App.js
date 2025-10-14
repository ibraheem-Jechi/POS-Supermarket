import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function App() {
  const [page, setPage] = useState('pos'); // default page is POS

  return (
    <div>
      <Header />
      <div style={{ display: 'flex', minHeight: '90vh' }}>
        <Sidebar setPage={setPage} />
        <MainContent page={page} />
      </div>
    </div>
  );
}

export default App;
