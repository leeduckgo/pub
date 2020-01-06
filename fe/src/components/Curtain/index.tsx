import React from 'react';
import ComputerIcon from '@material-ui/icons/Computer';

export default () => {
  return (
    <div className="page-layout-wrapper bg-page-bg">
      <div
        className="page-layout user-center flex column v-center h-center"
        style={{ height: '100vh' }}
      >
        <div className="po-text-56 primary-color">
          <ComputerIcon />
        </div>
        <span className="push-top-sm po-text-18 primary-color po-bold">请在电脑端打开链接</span>
        <span className="mt-2 text-blue-400 text-base">{window.location.origin}</span>
      </div>
    </div>
  );
};
