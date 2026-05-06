'use client';
import { useEffect, useRef } from 'react';
import { Editor } from 'grapesjs';
import initPageBuilder from '@/modules/page-builder-pro';
import ToastNotifier, { ToastNotifierHandle} from '@/modules/page-builder-pro/components/ToastNotifier';
import { ToastType } from '@/modules/page-builder-pro/types/ToastType';
import { DynamicRoleGuard } from '@/ui/components/DynamicRoleGuard';
export default function PageBuilderEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<ToastNotifierHandle>(null);

  useEffect(() => {
    if (!editorRef.current) return

    let editor: Editor

    const initAsync = async () => {
      try {
        editor = await initPageBuilder(editorRef.current!, (msg: string, type?: ToastType) => {
          toastRef.current?.show(msg, type);
        })
        // Editor initialized successfully
      } catch {
        // Error handled silently
      }
    }

    initAsync()

    return () => {
      try {
        if (editor && typeof editor.destroy === 'function') {
          editor.destroy()
        }
      } catch {
        // Error handled silently
      }
    }
  }, [])

  return (
    <DynamicRoleGuard path="/dashboard/page-builder">
      <div className="p-4">
        <h1 className="text-xl fw-bold mb-4">Editor Visual Pro</h1>
        <div ref={editorRef} id="gjs" style={{ height: '100vh', border: '1px solid #ddd' }} />
        <ToastNotifier ref={toastRef} />
      </div>
    </DynamicRoleGuard>
  );
}
