import React from 'react';

export default (props: any) => {
  const { onClick } = props;

  return (
    <button
      className="text-white py-2 px-4 rounded font-bold text-sm outline-none bg-green-color"
      onClick={() => {
        onClick && onClick();
      }}
    >
      <div className="flex justify-center items-center">{props.children}</div>
    </button>
  );
};
