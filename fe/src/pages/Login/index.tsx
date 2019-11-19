import React from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import Loading from '../../components/Loading';
import { Endpoint } from '../../utils';
import { useStore } from '../../store';

import './index.scss';

export default observer((props: any) => {
  const { userStore, settingStore } = useStore();
  const [provider, setProvider] = React.useState('');

  const selectProvider = (provider: string) => {
    setProvider(provider);
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

  if (!settingStore.isFetched) {
    return null;
  }

  const { authProviders = [] } = settingStore.settings;
  const allowMixin = authProviders.includes('mixin');
  const allowGithub = authProviders.includes('github');
  const allowPressone = authProviders.includes('pressone');

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
          <div className="dark-color text-center push-top-xs po-text-16">
            {settingStore.settings.slogan}
          </div>
          <div className="hr po-width-90 po-center push-top-md po-b-bb po-b-black-10"></div>
          <div className="dark-color text-center push-top-md">第三方账号登录</div>
          <div className="flex v-center h-center push-top-md">
            {allowMixin && (
              <Tooltip placement="top" title={'使用 Mixin 账号登陆'}>
                <a
                  href={getLoginUrl('mixin')}
                  onClick={() => selectProvider('mixin')}
                  className="mixin login-btn po-radius-50 mixin flex v-center h-center po-b-ba po-b-black-05 push-left-sm push-right-sm"
                >
                  {provider !== 'mixin' && (
                    <img src="https://static.press.one/pub/mixin.png" alt="mixin" />
                  )}
                  {provider === 'mixin' && <Loading size={20} />}
                </a>
              </Tooltip>
            )}
            {allowGithub && (
              <Tooltip placement="top" title={'使用 GitHub 账号登陆'}>
                <a
                  href={getLoginUrl('github')}
                  onClick={() => selectProvider('github')}
                  className="github login-btn po-radius-50 flex v-center h-center po-b-ba po-b-black-05 push-left-sm push-right-sm"
                >
                  {provider !== 'github' && (
                    <img src="https://static.press.one/pub/github.svg" alt="github" />
                  )}
                  {provider === 'github' && <Loading size={20} />}
                </a>
              </Tooltip>
            )}
            {allowPressone && (
              <Tooltip placement="top" title={'使用 PressOne 账号登陆'}>
                <a
                  href={getLoginUrl('pressone')}
                  onClick={() => selectProvider('pressone')}
                  className="pressone login-btn po-radius-50 flex v-center h-center po-b-ba po-b-black-05 push-left-sm push-right-sm"
                >
                  {provider !== 'pressone' && (
                    <img src="https://static.press.one/pub/pressone.png" alt="pressone" />
                  )}
                  {provider === 'pressone' && <Loading size={20} />}
                </a>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </Fade>
  );
});
