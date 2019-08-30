import React from 'react';
import BlockIcon from '@material-ui/icons/Block';

export default () => {
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
          您需要加入【BOX 定投践行群】才能使用这个写作工具
        </span>
        <a
          className="push-top po-bold"
          href="https://support.exinone.com/hc/zh-cn/articles/360032511651-关于加入-BOX-定投践行群-的说明"
        >
          如何加入？
        </a>
      </div>
    </div>
  );
};
