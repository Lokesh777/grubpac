import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useToastStore } from '@/stores/toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add a toast', () => {
    useToastStore.getState().addToast('Test message', 'success');
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Test message');
    expect(toasts[0].type).toBe('success');
  });

  it('should auto-remove toast after timeout', () => {
    useToastStore.getState().addToast('Auto remove', 'info');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(4000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should remove a toast by id', () => {
    useToastStore.getState().addToast('Remove me', 'error');
    const { toasts } = useToastStore.getState();
    const id = toasts[0].id;
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should default to info type', () => {
    useToastStore.getState().addToast('Default type');
    expect(useToastStore.getState().toasts[0].type).toBe('info');
  });
});
