import React from 'react';
import { observer } from 'mobx-react-lite';
import BlockIcon from '@material-ui/icons/Block';
import { useStore } from '../../store';

export default observer(() => {
  const store = useStore();

  if (!store.settings.isFetched) {
    return null;
  }

  return (
    <div className="page-layout-wrapper bg-page-bg">
      <div
        className="page-layout user-center flex column v-center h-center"
        style={{ height: '100vh' }}
      >
        <div className="po-text-56 primary-color">
          <BlockIcon />
        </div>
        <span className="push-top-sm po-text-18 primary-color po-bold">
          {store.settings.settings.denyText}
        </span>
        <a
          className="push-top po-bold"
          href={store.settings.settings.denyActionLink}
        >
          {store.settings.settings.denyActionText}
        </a>
      </div>
    </div>
  );
});
