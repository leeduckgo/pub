import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
} from '@material-ui/core';
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
      <DialogTitle id="alert-dialog-title">导入文章</DialogTitle>
      <DialogContent className="flex column v-center">
        <DialogContentText id="alert-dialog-description">
          粘贴文章链接，支持 press.one 和微信链接
        </DialogContentText>

        <TextField
          error={!validUrl && inputDirty}
          helperText={(!validUrl && inputDirty && '请输入正确的文章地址') || ' '}
          style={{ width: '100%' }}
          autoFocus
          value={inputValue}
          onChange={event => {
            setInputValue(event.target.value);
            setInputDirty(true);
          }}
        />
      </DialogContent>
      <DialogActions style={{ marginBottom: '12px' }} className="flex h-center">
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
          <span
            className={classNames({
              'import-dialog-confirm-content': true,
              hide: loading,
            })}
          >
            保存到草稿
          </span>
          <div
            className={classNames({
              'import-dialog-loading flex v-center h-center': true,
              hide: !loading,
            })}
          >
            <CircularProgress thickness={5} color="inherit" size={18} />
          </div>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostImportDialog;
