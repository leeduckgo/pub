import React from 'react';
import { useStore } from '../../store';
import Api from '../../api';

export default function Preload() {
  const { userStore, settingsStore } = useStore();

  React.useEffect(() => {
    (async () => {
      const tryFetchUser = async () => {
        try {
          const user = await Api.fetchUser();
          return user;
        } catch (err) {}
        return null;
      };

      const tryFetchSettings = async () => {
        try {
          const settings = await Api.fetchSettings();
          return settings;
        } catch (err) {}
        return {};
      };

      const [user, settings] = await Promise.all([tryFetchUser(), tryFetchSettings()]);
      if (user) {
        userStore.setUser(user);
      }
      settingsStore.setSettings(settings);
      document.title = settings['site.title'];
      userStore.setIsFetched(true);
      settingsStore.setIsFetched(true);
    })();
  }, [userStore, settingsStore]);

  return null;
}
