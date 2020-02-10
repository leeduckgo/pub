import React from 'react';
import { observer } from 'mobx-react-lite';
import { RouteChildrenProps, Route } from 'react-router';

import { Button, MenuItem, Popover, MenuList } from '@material-ui/core';

import AssignmentIcon from '@material-ui/icons/Assignment';
import CreateIcon from '@material-ui/icons/Create';
import ExpandLess from '@material-ui/icons/ExpandLess';
import classNames from 'classnames';
import AccountBalanceWallet from '@material-ui/icons/AccountBalanceWallet';
import ExitToApp from '@material-ui/icons/ExitToApp';
import ChromeReaderMode from '@material-ui/icons/ChromeReaderMode';
import Tooltip from '@material-ui/core/Tooltip';
import Help from '@material-ui/icons/Help';
import Fade from '@material-ui/core/Fade';

import { useStore } from '../../store';

import { Endpoint, getQuery, removeQuery, sleep } from '../../utils';

import './index.scss';
import Dashboard from '../Dashboard';
import Topic from '../Topic';
import WalletModal from 'components/WalletModal';

export default observer((props: RouteChildrenProps) => {
  const { userStore, snackbarStore, settingsStore } = useStore();
  const { user } = userStore;
  const { settings } = settingsStore;
  const [walletOpen, setWalletOpen] = React.useState(false);
  const [walletTab, setWalletTab] = React.useState('assets');
  const action = getQuery('action');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  React.useEffect(() => {
    (async () => {
      if (action === 'OPEN_WALLET_BINDING') {
        await sleep(1500);
        setWalletTab('mixinAccount');
        setWalletOpen(true);
        if (userStore.user.mixinAccount) {
          await sleep(800);
          snackbarStore.show({
            message: 'Mixin 账号绑定成功啦！',
          });
        }
        removeQuery('action');
      }
    })();
  }, [action, snackbarStore, userStore]);

  if (userStore.isFetched && !userStore.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const logout = () => {
    window.location.href = `${Endpoint.getApi()}/api/logout?from=${window.location.origin}/login`;
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navList = [
    {
      text: '文章',
      icon: CreateIcon,
      path: '/dashboard',
      show: true,
    },
    {
      text: '权限管理',
      icon: AssignmentIcon,
      path: '/topic',
      show: user.isAdmin,
    },
  ];

  return (
    <Fade in={true} timeout={500}>
      <div className="p-manage-layout flex">
        <nav className="p-manage-layout-nav flex flex-col justify-between border-r">
          <section className="pt-4 w-full">
            <div className="px-4 flex items-center">
              <div className="w-10 h-10">
                <img
                  className="w-10 h-10"
                  src="https://xue-images.pek3b.qingstor.com/1124-logo.png"
                  alt="logo"
                />
              </div>
              {settings['site.shortTitle'] && (
                <span className="text-base font-bold ml-4 text-gray-700 flex items-center">
                  {settings['site.shortTitle']}
                  <Tooltip
                    placement="right"
                    title="我们帮你把文章发布到区块链，之后会有不同的阅读站点把你的文章呈现给读者，这是去中心化的模式，一键发布，多端阅读"
                  >
                    <Help className="ml-1 text-gray-600" />
                  </Tooltip>
                </span>
              )}
            </div>
            <div className="mt-8 mx-2 pl-8 flex items-center leading-none">
              <a
                href={settingsStore.settings['reader.url']}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Tooltip
                  placement="right"
                  title="阅读站可以有很多个，是去中心化的，这只是其中一个。你的文章将会被不同的阅读站聚合，给千千万万的读者阅读并打赏"
                >
                  <div className="flex items-center text-lg text-gray-600 py-2">
                    <ChromeReaderMode />
                    <span className="text-sm ml-2">阅读站</span>
                  </div>
                </Tooltip>
              </a>
            </div>
            <ul className="p-manage-layout-nav-ul">
              <li className="px-5 mt-8 p-manage-layout-nav-ul-title p-manage-layout-nav-li text-sm text-gray-700 font-bold">
                管理
              </li>
              {navList
                .filter(v => v.show)
                .map(item => (
                  <li key={item.text} className="p-manage-layout-nav-li">
                    <div
                      onClick={() => props.history.push(item.path)}
                      className={classNames(
                        {
                          'bg-gray-200': props.location.pathname === item.path,
                        },
                        'mx-2 pl-8 flex items-center text-lg text-gray-600 py-2 mt-1 rounded cursor-pointer leading-none',
                      )}
                    >
                      <item.icon />
                      <span className="text-sm ml-2">{item.text}</span>
                    </div>
                  </li>
                ))}
            </ul>
          </section>

          {userStore.isLogin && (
            <Button
              className="p-manage-layout-nav-button flex"
              aria-controls="dashboard-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <img className="p-manage-layout-nav-img" src={user.avatar} width="34" alt="头像" />
              <div className="p-manage-layout-nav-info flex items-center">
                <span className="p-manage-layout-nav-info-name dark-color">{user.name}</span>
              </div>
              <div className="flex items-center">
                <ExpandLess className="p-manage-layout-nav-info-icon dark-color" />
              </div>
            </Button>
          )}

          {userStore.isLogin && (
            <Popover
              id="dashboard-menu"
              className="p-manage-layout-popover"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <MenuList>
                <MenuItem onClick={() => setWalletOpen(true)}>
                  <div className="py-2 flex items-center text-lg text-gray-700">
                    <AccountBalanceWallet />
                    <span className="text-sm ml-1">钱包</span>
                  </div>
                </MenuItem>
                <MenuItem onClick={logout}>
                  <div className="py-2 flex items-center text-lg text-gray-700">
                    <ExitToApp />
                    <span className="text-sm ml-1">登出</span>
                  </div>
                </MenuItem>
              </MenuList>
            </Popover>
          )}
        </nav>

        <main className="p-manage-layout-main flex flex-col">
          <Route path="/dashboard" exact component={Dashboard} />
          <Route path="/topic" exact component={Topic} />
        </main>

        <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} tab={walletTab} />
      </div>
    </Fade>
  );
});
