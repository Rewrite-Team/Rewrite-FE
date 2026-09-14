import { waitFor } from '@testing-library/react';

import type { InterviewSessionSnapshot } from './types';

interface TransactionHandlers {
  error: DOMException | null;
  onabort: ((event: Event) => void) | null;
  oncomplete: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
}

describe('interviewSessionStorage', () => {
  it('세션 저장은 IndexedDB transaction이 완료된 후 종료된다', async () => {
    const put = jest.fn();
    const transactionHandlers: TransactionHandlers = {
      error: null,
      onabort: null,
      oncomplete: null,
      onerror: null,
    };
    const transaction = {
      ...transactionHandlers,
      objectStore: () => ({ put }),
    } as unknown as IDBTransaction;
    const database = {
      close: jest.fn(),
      objectStoreNames: { contains: () => true },
      onversionchange: null,
      transaction: jest.fn(() => transaction),
    } as unknown as IDBDatabase;
    const openRequest = {
      error: null,
      onerror: null,
      onupgradeneeded: null,
      onsuccess: null,
      result: database,
    } as unknown as IDBOpenDBRequest;

    Object.defineProperty(window, 'indexedDB', {
      configurable: true,
      value: { open: jest.fn(() => openRequest) },
    });
    jest.resetModules();

    const { saveInterviewSessionSnapshot } = await import('./interviewSessionStorage');
    const snapshot: InterviewSessionSnapshot = {
      activeQuestionId: 1,
      questions: [],
      updatedAt: 1,
      version: 1,
      writingId: 'writing-1',
    };
    let isResolved = false;
    const savePromise = saveInterviewSessionSnapshot(snapshot).then(() => {
      isResolved = true;
    });

    openRequest.onsuccess?.call(openRequest, new Event('success'));

    await waitFor(() => {
      expect(put).toHaveBeenCalledWith(snapshot);
    });
    expect(isResolved).toBe(false);

    transaction.oncomplete?.call(transaction, new Event('complete'));
    await savePromise;

    expect(isResolved).toBe(true);
  });
});
