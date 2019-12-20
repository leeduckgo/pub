import React from 'react';
import { useStore } from '../../store';
import Api from '../../api';

export default function Preload() {
  const { userStore, settingsStore } = useStore();

  React.useEffect(() => {
    (async () => {
      try {
        const user = await Api.fetchUser();
        userStore.setUser(user);
      } catch (err) {}
      try {
        const settings = await Api.fetchSettings();
        settingsStore.setSettings(settings);
        document.title = settings['site.title'];
      } catch (err) {}
      userStore.setIsFetched(true);
      settingsStore.setIsFetched(true);
    })();
  }, [userStore, settingsStore]);

  return null;
}
