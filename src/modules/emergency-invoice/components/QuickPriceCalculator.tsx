import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export function QuickPriceCalculator({
  anchorRect,
  onApply,
  onClose,
}: {
  anchorRect: DOMRect;
  onApply: (total: number) => void;
  onClose: () => void;
}) {
  const popRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: anchorRect.bottom + 6,
    left: Math.max(8, anchorRect.right - 256),
    visibility: 'hidden', // ẩn tạm cho tới khi đo xong kích thước thật
  });

  useLayoutEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;

    let top = anchorRect.bottom + 6;
    let left = anchorRect.right - rect.width;

    // Không đủ chỗ phía dưới → bung lên trên nút bấm
    if (top + rect.height > window.innerHeight - margin) {
      top = anchorRect.top - rect.height - 6;
    }
    if (top < margin) top = margin;
    if (left < margin) left = margin;
    if (left + rect.width > window.innerWidth - margin) {
      left = window.innerWidth - rect.width - margin;
    }

    setStyle({ position: 'fixed', top, left, visibility: 'visible' });
  }, [anchorRect]);

  const [tape, setTape] = useState<number[]>([]);
  const [current, setCurrent] = useState('');

  const tapeSum = tape.reduce((s, v) => s + v, 0);
  const displayTotal = tapeSum + (Number(current) || 0);

  const pushDigit = (d: string) => {
    if (d === '.' && current.includes('.')) return;
    setCurrent((prev) => (prev + d).slice(0, 15));
  };

  const commitCurrent = () => {
    const num = Number(current);
    if (current !== '' && !Number.isNaN(num)) {
      setTape((prev) => [...prev, num]);
    }
    setCurrent('');
  };

  const handleBackspace = () => setCurrent((prev) => prev.slice(0, -1));
  const handleClear = () => {
    setTape([]);
    setCurrent('');
  };
  const handleRemoveLast = () => setTape((prev) => prev.slice(0, -1));
  const handleApply = () => {
    const currentNumber = Number(current) || 0;

    const total =
      tape.reduce((sum, item) => sum + item, 0) + currentNumber;

    if (current !== '') {
      commitCurrent();
    }

    onApply(total * 1000);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Số 0-9
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        pushDigit(e.key);
        return;
      }

      switch (e.key) {
        case '.':
        case ',':
          e.preventDefault();
          pushDigit('.');
          return;

        case '+':
          e.preventDefault();
          commitCurrent();
          return;

        case 'Backspace':
          e.preventDefault();
          handleBackspace();
          return;

        case 'Delete':
          e.preventDefault();
          handleClear();
          return;

        case 'Escape':
          e.preventDefault();
          onClose();
          return;

        case 'Enter':
        case '=':
          e.preventDefault();
          handleApply();
          return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [current, tape, displayTotal]);

  return createPortal(
    <div
      ref={popRef}
      style={style}
      className="z-[100] w-64 rounded-2xl border border-premium-border bg-white p-3 shadow-2xl"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="mb-2 max-h-24 overflow-y-auto rounded-xl bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-neutral-500 space-y-0.5">
        {tape.length === 0 && <p className="text-neutral-300">Nhập số rồi bấm +</p>}
        {tape.map((v, i) => (
          <div key={i}>{i === 0 ? v.toLocaleString('vi-VN') : `+ ${v.toLocaleString('vi-VN')}`}</div>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between rounded-xl border border-premium-border px-3 py-2">
        <span className="text-sm font-black text-neutral-800">{current || '0'}</span>
        <span className="text-[9px] font-bold text-premium-muted">
          Tổng: {displayTotal.toLocaleString('vi-VN')}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <CalcKey label="7" onClick={() => pushDigit('7')} />
        <CalcKey label="8" onClick={() => pushDigit('8')} />
        <CalcKey label="9" onClick={() => pushDigit('9')} />
        <CalcKey label="C" onClick={handleClear} variant="danger" />

        <CalcKey label="4" onClick={() => pushDigit('4')} />
        <CalcKey label="5" onClick={() => pushDigit('5')} />
        <CalcKey label="6" onClick={() => pushDigit('6')} />
        <CalcKey label="⌫" onClick={handleBackspace} />

        <CalcKey label="1" onClick={() => pushDigit('1')} />
        <CalcKey label="2" onClick={() => pushDigit('2')} />
        <CalcKey label="3" onClick={() => pushDigit('3')} />
        <CalcKey label="+" onClick={commitCurrent} variant="primary" />

        <CalcKey label="0" onClick={() => pushDigit('0')} />
        <CalcKey label="000" onClick={() => pushDigit('000')} />
        <CalcKey label="." onClick={() => pushDigit('.')} />
        <CalcKey label="=" onClick={commitCurrent} variant="primary" />
      </div>

      {tape.length > 0 && (
        <button
          type="button"
          onClick={handleRemoveLast}
          className="mt-1.5 w-full text-[9px] font-bold text-neutral-400 hover:text-neutral-600"
        >
          Xoá dòng cuối
        </button>
      )}

      <div className="mt-2 flex gap-1.5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-8 rounded-xl border border-premium-border text-[10px] font-bold text-neutral-500 hover:bg-slate-50"
        >
          Đóng
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 h-8 rounded-xl bg-[image:var(--image-gold-gradient)] text-white text-[10px] font-black shadow-gold hover:opacity-90"
        >
          Áp dụng
        </button>
      </div>
    </div>,
    document.body
  );
}

function CalcKey({
  label,
  onClick,
  variant = 'default',
}: {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
}) {
  const styles =
    variant === 'primary'
      ? 'bg-[image:var(--image-gold-gradient)] text-white shadow-gold'
      : variant === 'danger'
        ? 'bg-red-50 text-red-500'
        : 'bg-slate-50 text-neutral-700 hover:bg-slate-100';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-lg text-xs font-black transition-all ${styles}`}
    >
      {label}
    </button>
  );
}
