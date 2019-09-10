import React from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip } from '@material-ui/core';
import Mood from '@material-ui/icons/Mood';
import Loading from '../../components/Loading';
import { useStore } from '../../store';

import './index.scss';

export default observer((props: any) => {
  const store = useStore();
  const { user, settings } = store;
  const [provider, setProvider] = React.useState('');
  const [showTooltip, setShowTooltip] = React.useState(false);

  const selectProvider = (provider: string) => {
    setProvider(provider);
  };

  const getLoginUrl = (provider: string) => {
    const { REACT_APP_API_ENDPOINT, REACT_APP_CLIENT_ENDPOINT } = process.env;
    return `${REACT_APP_API_ENDPOINT}/api/auth/${provider}/login?redirect=${REACT_APP_CLIENT_ENDPOINT}/dashboard`;
  };

  if (user.isFetched && user.isLogin) {
    setTimeout(() => {
      props.history.push('/dashboard');
    }, 0);
  } else {
    setTimeout(() => {
      setShowTooltip(true);
    }, 2000);
  }

  if (!settings.isFetched) {
    return null;
  }

  const { authProviders = [] } = settings.settings;
  const allowMixin = authProviders.includes('mixin');
  const allowGithub = authProviders.includes('github');
  const allowPressone = authProviders.includes('pressone');

  return (
    <div className="login bg flex v-center h-center po-fade-in">
      <div className="container flex column v-center h-center po-center bg-white-color pad-xl po-width-300 po-radius-5">
        <div className="text-center po-text-56 primary-color">
          <Tooltip open={showTooltip} placement="top" title={'西乔，给我设计个 logo 吧～'}>
            <Mood />
          </Tooltip>
        </div>
        <div className="dark-color text-center push-top-xs po-text-16">{settings.settings.slogan}</div>
        <div className="hr po-width-90 po-center push-top-md po-b-bb po-b-black-10"></div>
        <div className="dark-color text-center push-top-md">第三方账号登录</div>
        <div className="flex v-center h-center push-top-md">
          {allowMixin && 
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
          }
          {allowGithub && 
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
          }
          {allowPressone && 
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
          }
        </div>
      </div>
    </div>
  );
});
