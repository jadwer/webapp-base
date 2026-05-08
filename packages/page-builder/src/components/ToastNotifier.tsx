'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import Toast from 'react-bootstrap/Toast';

import type { ToastType } from '../types/ToastType';

export interface ToastNotifierHandle {
  show: (message: string, type?: ToastType) => void;
}

const ToastNotifier = forwardRef<ToastNotifierHandle>((_, ref) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<ToastType>('success');

  useImperativeHandle(ref, () => ({
    show(msg: string, type: ToastType = 'success') {
      setMessage(msg);
      setVariant(type);
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    },
  }));

  const bgColor = variant === 'error' ? 'danger' : variant;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 1050,
      }}
    >
      <Toast show={show} bg={bgColor} onClose={() => setShow(false)}>
        <Toast.Body className="text-white">{message}</Toast.Body>
      </Toast>
    </div>
  );
});

ToastNotifier.displayName = 'ToastNotifier';

export default ToastNotifier;
