import React from 'react';
import { observer } from 'mobx-react-lite';
import Snackbar from '@material-ui/core/Snackbar';
import { useStore } from '../../store';

export default observer((props: any) => {
  const { snackbar } = useStore();
  return (
    <Snackbar
      className="snackBar"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={snackbar.isOpenning}
      autoHideDuration={3000}
      onClose={() => snackbar.close()}
      message={snackbar.msg}
    />
  );
});