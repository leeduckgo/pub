import React from 'react';
import { observer, useLocalStore } from 'mobx-react-lite';
import { Button } from '@material-ui/core';
import Translate from '@material-ui/icons/Translate';
import Api from './api';
import qs from 'query-string';
import './App.css';

import './style/base.scss';

const { useEffect } = React;

function App() {
  const store = useLocalStore(() => ({
    name: 'junhong',
    location: 'guangzhou',
    isLogin: false,
    user: {
      avatar: '',
      name: '',
      bio: '',
    },
    translate() {
      this.name = '俊鸿';
      this.location = '广州';
    },
    setUser(user: any) {
      this.isLogin = true;
      this.user = user;
    },
  }));

  useEffect(() => {
    (async () => {
      try {
        const user = await Api.fetchUser();
        store.setUser(user);
      } catch (err) {}
    })();
    const { goNext } = qs.parse(window.location.search);
    if (goNext) {
      window.history.replaceState({}, document.title, '.');
      const next = String(localStorage.getItem('next'));
      if (!next) {
        return;
      }
      // redirect by router
      // window.location.href = next;
      localStorage.removeItem('next');
    }
  }, [store]);

  const login = () => {
    localStorage.setItem('next', window.location.href);
    window.location.href =
      'https://github.com/login/oauth/authorize?client_id=a269deced07c748a3526&redirect_uri=http://localhost:8090/github/oauth/callback';
  };

  const logout = () => {
    const { href } = window.location;
    window.location.href = `http://localhost:8090/logout?from=${href}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>测试 Mobx</h2>
        <div className="po-bold">{store.name}</div>
        <div className="push-top">地点：{store.location}</div>
        <Button className="push-top" variant="contained" color="primary" onClick={store.translate}>
          翻译 <Translate />
        </Button>
        <div className="push-top">------------------------------------</div>
        <h2>测试登陆、登出</h2>
        {!store.isLogin && (
          <Button variant="contained" color="primary" onClick={login}>
            使用 Github 账号登陆
          </Button>
        )}
        {store.isLogin && (
          <img className="push-top" src={store.user.avatar} width="100" alt="头像" />
        )}
        {store.isLogin && <div className="push-top">{store.user.name}</div>}
        {store.isLogin && (
          <Button className="push-top" variant="contained" color="primary" onClick={logout}>
            登出
          </Button>
        )}
      </header>
    </div>
  );
}

export default observer(App);
