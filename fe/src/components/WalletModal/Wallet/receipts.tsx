import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import Fade from '@material-ui/core/Fade';
import Loading from 'components/Loading';
import { assetIconMap } from './utils';
import FinanceApi from './api';
import { sleep } from 'utils';
import { useStore } from 'store';

const getTypeName = (type: string) => {
  const map: any = {
    RECHARGE: '充值',
    WITHDRAW: '提现',
    REWARD: '读者打赏文章',
  };
  return map[type];
};

const Receipt = (receipt: any, mixinWalletClientId: string) => {
  return (
    <div className="flex justify-between items-center py-3 px-2 leading-none border-b border-gray-300">
      <div className="flex items-center text-gray-700 text-sm">
        <img
          className="mr-4"
          src={assetIconMap[receipt.currency]}
          alt={receipt.currency}
          width="40"
          height="40"
        />
        {getTypeName(receipt.type)}
      </div>
      <div className="flex items-center">
        <span
          className={classNames(
            {
              'text-green-400': mixinWalletClientId === receipt.toProviderUserId,
              'text-red-400': mixinWalletClientId === receipt.fromProviderUserId,
            },
            'font-bold text-lg mr-1',
          )}
        >
          {mixinWalletClientId === receipt.toProviderUserId && '+'}
          {mixinWalletClientId === receipt.fromProviderUserId && '-'}
          {receipt.amount}
        </span>
        <span className="text-xs font-bold">{receipt.currency}</span>
      </div>
    </div>
  );
};

export default observer(() => {
  const { userStore, walletStore } = useStore();
  const { mixinWalletClientId } = userStore.user;
  const { isFetchedReceipts, receipts } = walletStore;

  React.useEffect(() => {
    (async () => {
      try {
        const receipts = await FinanceApi.getReceipts({
          limit: 100,
        });
        await sleep(800);
        walletStore.setReceipts(receipts);
        walletStore.setIsFetchedReceipts(true);
      } catch (err) {}
    })();
  }, [walletStore]);

  if (!isFetchedReceipts) {
    return (
      <div className="mt-32">
        <Loading />
      </div>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <div>
        {receipts.map((receipt: any) => (
          <div key={receipt.id}>{Receipt(receipt, mixinWalletClientId)}</div>
        ))}
      </div>
    </Fade>
  );
});
