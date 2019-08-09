import React from 'react';
import { observer, useLocalStore } from 'mobx-react-lite';
import { Button } from '@material-ui/core';
import Translate from '@material-ui/icons/Translate';
import './App.css';

function App() {
  const store = useLocalStore(() => ({
    name: 'junhong',
    location: 'guangzhou',
    translate() {
      this.name = '俊鸿';
      this.location = '广州';
    },
  }));

  return (
    <div className="App">
      <header className="App-header">
        <div>{store.name}</div>
        <div>地点：{store.location}</div>
        <Button variant="contained" color="primary" onClick={store.translate}>
          翻译 <Translate />
        </Button>
      </header>
    </div>
  );
}

export default observer(App);
