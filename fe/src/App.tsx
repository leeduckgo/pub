import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';

import Preload from './components/Preload';
import Socket from './components/Socket';

import { StoreProvider } from './store';

import './style/base.scss';

const AppRouter = () => {
  return (
    <StoreProvider>
      <Router>
        <div>
          <Preload />
          <Socket />
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/dashboard" exact component={Dashboard} />
          <Route path="/editor" exact component={Editor} />
        </div>
      </Router>
    </StoreProvider>
  );
};

export default AppRouter;
