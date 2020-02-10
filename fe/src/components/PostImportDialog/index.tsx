import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from '@material-ui/core';
import ButtonProgress from 'components/ButtonProgress';
import './index.scss';
import { pressOneLinkRegexp, wechatLinkRegexp } from '../../utils/import';

interface IProps {
  open: boolean;
  loading: boolean;
  cancel: () => void;
  ok: (url: string) => void;
}

const PostImportDialog = (props: IProps) => {
  const { open, loading, cancel, ok } = props;
  const [inputValue, setInputValue] = useState('');
  const [inputDirty, setInputDirty] = useState(false);

  const handleOk = () => {
    ok(inputValue);
  };

  const validUrl = [pressOneLinkRegexp.test(inputValue), wechatLinkRegexp.test(inputValue)].some(
    Boolean,
  );

  return (
    <Dialog
      className="import-dialog"
      open={open}
      onClose={cancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <div className="pt-1 text-center">导入文章</div>
      </DialogTitle>
      <DialogContent className="flex justify-center items-center flex-col">
        <div className="px-5">
          <DialogContentText id="alert-dialog-description">
            <div className="text-sm text-gray-600">支持微信公众号文章、PRESSone文章</div>
          </DialogContentText>

          <TextField
            error={!validUrl && inputDirty}
            helperText={(!validUrl && inputDirty && '请输入正确的文章地址') || ' '}
            style={{ width: '100%' }}
            autoFocus
            placeholder="粘贴文章链接"
            variant="outlined"
            value={inputValue}
            onChange={event => {
              setInputValue(event.target.value);
              setInputDirty(true);
            }}
          />
        </div>
      </DialogContent>
      <DialogActions style={{ marginBottom: '12px' }}>
        <div className="flex justify-center items-center -mt-2 pb-2 w-full">
          <Button
            className={classNames({
              'primary import-dialog-confirm-button': true,
              loading: loading,
            })}
            variant="contained"
            onClick={handleOk}
            disabled={loading}
            color="primary"
          >
            导入 <ButtonProgress isDoing={loading} />
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default PostImportDialog;
