'use client';
import { useEffect, useRef } from 'react';
import initPageBuilder from '@/modules/page-builder-pro';
import ToastNotifier, { ToastNotifierHandle} from '@/modules/page-builder-pro/components/ToastNotifier';
import { ToastType } from '@/modules/page-builder-pro/types/ToastType';
export default function PageBuilderEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<ToastNotifierHandle>(null);

  useEffect(() => {
    if (editorRef.current) {
      initPageBuilder(editorRef.current, (msg: string, type?: ToastType) => {
        toastRef.current?.show(msg, type);
      });
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl fw-bold mb-4">Editor Visual Pro</h1>
      <div ref={editorRef} id="gjs" style={{ height: '100vh', border: '1px solid #ddd' }} />
      <ToastNotifier ref={toastRef} />
    </div>
  );
}
