import simplemde from 'simplemde';

export default {
  lineWrapping: true,
  spellChecker: false,
  status: false,
  minHeight: '80px',
  placeholder: '开始创作你的文章...',
  toolbar: [
    {
      name: "bold",
      action: simplemde.toggleBold,
      className: "fa fa-bold",
      title: "黑体 (Cmd-B)",
    },
    {
      name: "italic",
      action: simplemde.toggleItalic,
      className: "fa fa-italic",
      title: "斜体 (Cmd-I)",
    },
    '|',
    {
      name: "quote",
      action: simplemde.toggleBlockquote,
      className: "fa fa-quote-left",
      title: "引用 (Cmd-')",
    },
    {
      name: "unordered-list",
      action: simplemde.toggleUnorderedList,
      className: "fa fa-list-ul",
      title: "无序列表 (Cmd-L)",
    },
    {
      name: "ordered-list",
      action: simplemde.toggleOrderedList,
      className: "fa fa-list-ol",
      title: "有序列表 (Cmd-⌥-L)",
    },
    '|',
    {
      name: "link",
      action: simplemde.drawLink,
      className: "fa fa-link",
      title: "链接 (Cmd-K)",
    },
    {
      name: "image",
      action: simplemde.drawImage,
      className: "fa fa-picture-o",
      title: "插入图片 (Cmd-⌥-I)",
    },
    '|',
    {
      name: "preview",
      action: simplemde.togglePreview,
      className: "fa fa-eye no-disable",
      title: "预览 (Cmd-P)",
    },
  ],
};
