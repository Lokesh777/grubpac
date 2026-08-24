import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/useToast';
import { useToastStore } from '@/stores/toastStore';

describe('useToast hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return success, error, info, and warning functions', () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.success).toBe('function');
    expect(typeof result.current.error).toBe('function');
    expect(typeof result.current.info).toBe('function');
    expect(typeof result.current.warning).toBe('function');
  });

  it('should add a success toast when calling success()', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success('Task completed');
    });
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Task completed');
    expect(toasts[0].type).toBe('success');
  });

  it('should add an error toast when calling error()', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.error('Something went wrong');
    });
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('error');
  });

  it('should add an info toast when calling info()', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.info('FYI');
    });
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('info');
  });

  it('should add a warning toast when calling warning()', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.warning('Be careful');
    });
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('warning');
  });
});
