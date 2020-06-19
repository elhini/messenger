import React from 'react';
import List from './components/List';
import Chat from './components/Chat';
import './App.css';

function App() {
  return (
    <div className="App">
      <List />
      <div className="divider"></div>
      <Chat />
    </div>
  );
}

export default App;
