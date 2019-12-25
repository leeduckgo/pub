import React from 'react';
import { observer } from 'mobx-react-lite';
import BlockIcon from '@material-ui/icons/Block';
import { useStore } from '../../store';

export default observer(() => {
  const { settingsStore } = useStore();

  if (!settingsStore.isFetched) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div className="-mt-64">
        <div className="text-6xl text-red-500">
          <BlockIcon />
        </div>
        <div className="mt-2 text-lg text-gray-700 font-bold">
          {settingsStore.settings['permission.denyText']}
        </div>
        <div className="mt-4">
          <a
            className="font-bold green-color"
            href={settingsStore.settings['permission.denyActionLink']}
          >
            {settingsStore.settings['permission.denyActionText']}
          </a>
        </div>
      </div>
    </div>
  );
});
