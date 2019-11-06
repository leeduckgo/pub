import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import ManagementLayout from './pages/ManagementLayout';
import Editor from './pages/Editor';
import PermissionDeny from './pages/PermissionDeny';

import Preload from './components/Preload';
import Socket from './components/Socket';
import SnackBar from './components/SnackBar';
import Curtain from './components/Curtain';

import { StoreProvider } from './store';
import { isMobile } from './utils';

const AppRouter = () => {
  return isMobile() ? (
    <Curtain />
  ) : (
    <StoreProvider>
      <Router>
        <div>
          <Preload />
          <Socket />
          <SnackBar />
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />

          <Route path={[
            '/dashboard',
            '/topic',
          ]} exact component={ManagementLayout} />

          <Route path="/editor" exact component={Editor} />
          <Route path="/permissionDeny" exact component={PermissionDeny} />
        </div>
      </Router>
    </StoreProvider>
  );
};

export default AppRouter;
