import React from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import Loading from '../../components/Loading';
import { Endpoint } from '../../utils';
import { useStore } from '../../store';

import './index.scss';

export default observer((props: any) => {
  const { userStore, settingsStore } = useStore();
  const { settings } = settingsStore;
  const providers = settings['auth.providers'];
  const [loadingProvider, setLoadingProvider] = React.useState('');

  const selectProvider = (provider: string) => {
    setLoadingProvider(provider);
  };

  const getLoginUrl = (provider: string) => {
    return `${Endpoint.getApi()}/api/auth/${provider}/login?redirect=${
      window.location.origin
    }/dashboard`;
  };

  if (userStore.isFetched && userStore.isLogin) {
    setTimeout(() => {
      props.history.push('/dashboard');
    }, 0);
  }

  if (!settingsStore.isFetched) {
    return null;
  }

  const getIconUrl = (provider: string) => {
    const iconMap: any = {
      mixin: 'https://static.press.one/pub/mixin.png',
      github: 'https://static.press.one/pub/github.svg',
      pressone: 'https://static.press.one/pub/pressone.png',
    };
    return iconMap[provider];
  };

  const Provider = (props: any) => {
    const { provider } = props;
    return (
      <Tooltip placement="top" title={`使用 ${provider} 账号登录`}>
        <a
          href={getLoginUrl(provider)}
          onClick={() => selectProvider(provider)}
          className={`${provider} login-btn po-radius-50 flex v-center h-center po-b-ba po-b-black-05 push-left-sm push-right-sm`}
        >
          {loadingProvider !== provider && <img src={getIconUrl(provider)} alt={provider} />}
          {loadingProvider === provider && <Loading size={20} />}
        </a>
      </Tooltip>
    );
  };

  return (
    <Fade in={true} timeout={1000}>
      <div className="login bg flex v-center h-center">
        <div className="login-container flex column v-center h-center po-center bg-white-color pad-xl po-width-300 po-radius-5">
          <div className="text-center po-text-56">
            <img
              src="https://static.press.one/pub/logo_cn.png"
              width="120"
              height="107"
              alt="fly-pub"
            />
          </div>
          <div className="mt-2 text-center text-gray-700 text-lg font-bold">
            {settingsStore.settings['site.shortTitle']}
          </div>
          <div className="mt-5 text-gray-600 text-center w-40 text-sm">
            {settingsStore.settings['site.slogan']}
          </div>
          <div className="hr po-width-90 po-center push-top-md po-b-bb po-b-black-10"></div>
          <div className="dark-color text-center push-top-md">第三方账号登录</div>
          <div className="flex v-center h-center push-top-md">
            {providers.map((provider: string) => (
              <div key={provider}>
                <Provider provider={provider} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Fade>
  );
});
