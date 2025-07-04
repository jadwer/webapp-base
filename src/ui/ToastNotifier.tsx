'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import Toast from 'react-bootstrap/Toast';

export interface ToastNotifierHandle {
  show: (message: string) => void;
}

const ToastNotifier = forwardRef<ToastNotifierHandle>((_, ref) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useImperativeHandle(ref, () => ({
    show(msg: string) {
      setMessage(msg);
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    },
  }));

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 1050,
      }}
    >
      <Toast show={show} bg="success" onClose={() => setShow(false)}>
        <Toast.Body className="text-white">{message}</Toast.Body>
      </Toast>
    </div>
  );
});

ToastNotifier.displayName = 'ToastNotifier';

export default ToastNotifier;
