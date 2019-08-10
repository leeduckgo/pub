import React from 'react';
import { useStore } from '../../store';
import Api from '../../api';

export default function Preload() {
  const store = useStore();

  React.useEffect(() => {
    (async () => {
      try {
        const user = await Api.fetchUser();
        store.user.setUser(user);
      } catch (err) {}
      store.user.setIsFetched();
    })();
  }, [store]);

  return null;
}
