import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Preload from './components/Preload';

import { StoreProvider } from './store';

import './style/base.scss';

const AppRouter = () => {
  return (
    <StoreProvider>
      <Router>
        <div>
          <Preload />
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/dashboard" exact component={Dashboard} />
        </div>
      </Router>
    </StoreProvider>
  );
};

export default AppRouter;
