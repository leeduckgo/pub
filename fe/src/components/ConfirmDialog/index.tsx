import React from 'react';
import Modal from '@material-ui/core/Modal';
import Marked from 'marked';

interface IProps {
  open: boolean;
  content?: string;
  ContentComponent?: any;
  cancelText?: string;
  okText?: string;
  cancel: () => void;
  ok: () => void;
}

export default class ConfirmDialog extends React.Component<IProps, any> {
  render() {
    const { open, content, ContentComponent, cancel, ok, cancelText, okText = '确定' } = this.props;
    return (
      <Modal open={open} onClose={() => cancel()} className="flex v-center h-center">
        <div className="modal-content bg-white-color po-radius-3">
          <div className="dark-color pad-top-lg pad-bottom po-width-500">
            {content && (
              <div
                className="po-center pad-left-lg pad-right-lg markdown-body"
                dangerouslySetInnerHTML={{ __html: Marked(content) }}
              ></div>
            )}
            {ContentComponent && (
              <div className="po-center pad-left-lg pad-right-lg">{ContentComponent()}</div>
            )}
            <div className="push-top-md flex end border-top pad-top push-right push-left pad-bottom">
              {cancelText && cancel && (
                <a href="" className="gray-color push-right-md" onClick={() => cancel()}>
                  {cancelText}
                </a>
              )}
              <a href="" className="link-color push-right" onClick={() => ok()}>
                {okText}
              </a>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
