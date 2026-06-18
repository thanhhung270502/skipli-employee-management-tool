"use client";
import React from "react";

interface OtpInputProps {
  otp: string[];
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

export function OtpInput({
  otp,
  onChange,
  onKeyDown,
  onPaste,
  inputRefs,
}: OtpInputProps) {
  return (
    <div className="otp-input-group" onPaste={onPaste}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="otp-input"
        />
      ))}
    </div>
  );
}
