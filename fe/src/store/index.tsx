import React from 'react';
import { toJS } from 'mobx';
import { useLocalStore } from 'mobx-react-lite';
import { createUserStore } from './user';
import { createFilesStore } from './files';
import { createSnackbarStore } from './snackbar';
import { createSettingsStore } from './settings';
import { createWalletStore } from './wallet';

const storeContext = React.createContext<any>(null);

interface IProps {
  children: React.ReactNode;
}

export const StoreProvider = ({ children }: IProps) => {
  const store = {
    userStore: useLocalStore(createUserStore),
    fileStore: useLocalStore(createFilesStore),
    snackbarStore: useLocalStore(createSnackbarStore),
    settingStore: useLocalStore(createSettingsStore),
    walletStore: useLocalStore(createWalletStore),
  };
  return <storeContext.Provider value={store}>{children}</storeContext.Provider>;
};

export const useStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    throw new Error('You have forgot to use StoreProvider');
  }
  (window as any).toJS = toJS;
  (window as any).store = store;
  return store;
};
