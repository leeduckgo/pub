import React from 'react';
import { observer } from 'mobx-react-lite';

import clsx from 'clsx';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, Theme } from '@material-ui/core/styles';

import { useStore } from '../../store';

const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon,
};

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: '20px!important',
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  margin: {
    margin: theme.spacing(1),
  },
}));

export default observer(() => {
  const { snackbarStore, settingStore } = useStore();
  const classes = useStyles();
  const Icon = variantIcon[snackbarStore.type === 'error' ? 'error' : 'success'];
  const { postsEndpoint } = settingStore.settings;
  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarStore.open}
        autoHideDuration={snackbarStore.autoHideDuration}
        onClose={() => snackbarStore.close()}
      >
        <SnackbarContent
          className={clsx(classes.margin)}
          message={
            <span id="client-snackbarStore" className={classes.message}>
              <Icon className={clsx(classes.icon, classes.iconVariant)} />
              {snackbarStore.message}
            </span>
          }
          action={[
            snackbarStore.type === 'socket' ? (
              <span
                className="po-cp pr-2"
                key="redirect"
                onClick={() => {
                  window.open(`${postsEndpoint}/posts/${snackbarStore.meta.rId}`);
                }}
              >
                去看看
              </span>
            ) : (
              <IconButton
                key="close"
                aria-label="close"
                color="inherit"
                onClick={() => {
                  snackbarStore.close();
                }}
              >
                <CloseIcon className={classes.icon} />
              </IconButton>
            ),
          ]}
        />
      </Snackbar>
      <style jsx global>{`
        .MuiSnackbar-root .MuiTypography-root {
          background: #63b3ed !important;
        }
      `}</style>
    </div>
  );
});
