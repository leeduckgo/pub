import React from 'react';
import OTPInput from 'otp-input-react';

export default (props: any) => {
  const { value = '', onChange } = props;
  return (
    <div>
      <OTPInput
        inputClassName="border border-gray-400 rounded opt-input"
        value={value}
        onChange={onChange}
        autoFocus
        OTPLength={6}
        otpType="number"
        secure
      />
      <style jsx global>{`
        .opt-input {
          margin: 0 2px !important;
          color: #000;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
      `}</style>
    </div>
  );
};
