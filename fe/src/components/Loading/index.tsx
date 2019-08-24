import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import classNames from 'classnames';

export default function(props: any) {
  const { size, spaceSize, isPage } = props;
  return (
    <div
      className={classNames(
        {
          'po-push-page-middle': isPage,
          'push-top-md pad-bottom-md': spaceSize === 'small',
          'push-top-lg pad-bottom-lg': spaceSize === 'medium',
          'push-top-xxl pad-bottom-xxl': spaceSize === 'large',
        },
        'loading text-center',
      )}
    >
      <CircularProgress size={size || 40} className="primary-color" />
    </div>
  );
}
