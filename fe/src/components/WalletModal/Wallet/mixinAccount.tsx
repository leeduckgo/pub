import React from 'react';
import Info from '@material-ui/icons/Info';
import CheckCircle from '@material-ui/icons/CheckCircle';
import { Endpoint } from 'utils';
import { useStore } from 'store';

const getBindUrl = (provider: string) => {
  return `${Endpoint.getApi()}/api/auth/${provider}/bind?redirect=${
    window.location.origin
  }/dashboard?action=OPEN_WALLET_BINDING`;
};

export default () => {
  const { userStore } = useStore();
  const { mixinAccount } = userStore.user;

  return (
    <div className="text-sm mt-5">
      {!mixinAccount && (
        <div className="flex justify-between p-3 border border-blue-400 text-blue-400 bg-blue-100 flex items-center rounded mb-2 text-sm">
          <div className="flex items-center text-lg">
            <Info />
            <span className="ml-1 text-sm mr-1">尚未绑定 Mixin 账号</span>
          </div>
          <a href={getBindUrl('mixin')} className="text-blue-400 cursor-pointer font-bold pr-2">
            去绑定
          </a>
        </div>
      )}
      {mixinAccount && (
        <div className="mb-4 text-green-500 flex items-center text-lg">
          <CheckCircle />
          <span className="text-sm ml-1">已绑定</span>
        </div>
      )}
      {mixinAccount && (
        <div className="flex items-center">
          <div className="flex">
            <img
              className="w-10 h-10 rounded-full"
              src={mixinAccount.avatar_url}
              alt="mixin avatar"
            />
            <div className="ml-3">
              <div className="font-bold">{mixinAccount.full_name}</div>
              <div className="text-gray-500 text-xs">{mixinAccount.identity_number}</div>
            </div>
          </div>
          <a
            href={getBindUrl('mixin')}
            className="text-blue-400 cursor-pointer font-bold ml-5 text-xs"
          >
            重新绑定
          </a>
        </div>
      )}
      <div className="flex items-center text-gray-500 mt-5">
        <Info />
        <span className="text-xs ml-1">这个账号用于提现。提现的资产将转给这个 Mixin 账号。</span>
      </div>
    </div>
  );
};
