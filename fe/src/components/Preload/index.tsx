import React from 'react';
import { useStore } from '../../store';
import Api from '../../api';

export default function Preload() {
  const { userStore, settingStore } = useStore();

  React.useEffect(() => {
    (async () => {
      try {
        const user = await Api.fetchUser();
        userStore.setUser(user);
      } catch (err) {}
      try {
        const settings = await Api.fetchSettings();
        settingStore.setSettings(settings);
        document.title = settings.title;
      } catch (err) {}
      userStore.setIsFetched();
    })();
  }, [userStore, settingStore]);

  return null;
}
