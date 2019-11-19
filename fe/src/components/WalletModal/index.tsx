import React from 'react';
import { observer } from 'mobx-react-lite';
import Modal from '@material-ui/core/Modal';
import Wallet from './Wallet';
import css from 'styled-jsx/css';

const style = css`
  .wallet-modal {
    width: 860px;
  }
  .wallet-modal-content,
  :global(.wallet-content) {
    height: 600px;
    overflow: auto;
  }
`;

export default observer((props: any) => {
  const { open, onClose, tab } = props;
  return (
    <Modal open={open} onClose={onClose} className="flex justify-center items-center">
      <div className="wallet-modal max-h-screen overflow-auto">
        <div className="bg-white rounded wallet-modal-content relative">
          <Wallet tab={tab} />
        </div>
        <style jsx>{style}</style>
      </div>
    </Modal>
  );
});
