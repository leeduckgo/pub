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
      <Modal open={open} onClose={() => cancel()} className="flex justify-center items-center">
        <div className="modal-content bg-white rounded-sm">
          <div className="text-gray-500 pt-6 pb-3 ex-width-500">
            {content && (
              <div
                className="mx-auto px-5 markdown-body"
                dangerouslySetInnerHTML={{ __html: Marked(content) }}
              ></div>
            )}
            {ContentComponent && <div className="mx-auto px-5">{ContentComponent()}</div>}
            <div className="mt-5 flex justify-end border-top pt-2 mx-3 pb-3">
              {cancelText && cancel && (
                <a href="#/" className="gray-color mr-5" onClick={() => cancel()}>
                  {cancelText}
                </a>
              )}
              <a href="#/" className="link-color mr-3" onClick={() => ok()}>
                {okText}
              </a>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
