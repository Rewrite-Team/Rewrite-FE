import type { InterviewRecordingData, InterviewSessionSnapshot } from './types';

const DATABASE_NAME = 'rewrite-interview';
const DATABASE_VERSION = 1;
const RECORDING_STORE_NAME = 'recordings';
const SESSION_STORE_NAME = 'sessions';

let databasePromise: Promise<IDBDatabase> | null = null;

function isIndexedDbSupported() {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function openInterviewDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(SESSION_STORE_NAME)) {
          database.createObjectStore(SESSION_STORE_NAME, { keyPath: 'writingId' });
        }

        if (!database.objectStoreNames.contains(RECORDING_STORE_NAME)) {
          const recordingStore = database.createObjectStore(RECORDING_STORE_NAME, {
            keyPath: 'id',
          });

          recordingStore.createIndex('writingId', 'writingId');
        }
      };
      request.onsuccess = () => {
        const database = request.result;

        database.onversionchange = () => {
          database.close();
          databasePromise = null;
        };
        resolve(database);
      };
    }).catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

function waitForRequest<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/** 같은 브라우저에 저장된 면접 세션을 자기소개서 식별자로 조회합니다. */
export async function getInterviewSessionSnapshot(writingId: string) {
  if (!isIndexedDbSupported()) {
    return undefined;
  }

  const database = await openInterviewDatabase();
  const transaction = database.transaction(SESSION_STORE_NAME, 'readonly');
  const request = transaction.objectStore(SESSION_STORE_NAME).get(writingId);

  return waitForRequest<InterviewSessionSnapshot | undefined>(request);
}

/** 질문과 채팅 상태를 새로고침 후 복원할 수 있도록 저장합니다. */
export async function saveInterviewSessionSnapshot(snapshot: InterviewSessionSnapshot) {
  if (!isIndexedDbSupported()) {
    return;
  }

  const database = await openInterviewDatabase();
  const transaction = database.transaction(SESSION_STORE_NAME, 'readwrite');
  const request = transaction.objectStore(SESSION_STORE_NAME).put(snapshot);

  await waitForRequest(request);
}

/** 채팅 메시지에 연결할 원본 녹음 Blob을 별도 저장소에 저장합니다. */
export async function saveInterviewRecording(recording: InterviewRecordingData) {
  if (!isIndexedDbSupported()) {
    return;
  }

  const database = await openInterviewDatabase();
  const transaction = database.transaction(RECORDING_STORE_NAME, 'readwrite');
  const request = transaction.objectStore(RECORDING_STORE_NAME).put(recording);

  await waitForRequest(request);
}

/** 메시지의 녹음 식별자로 재생할 음성 Blob을 조회합니다. */
export async function getInterviewRecording(recordingId: string) {
  if (!isIndexedDbSupported()) {
    return undefined;
  }

  const database = await openInterviewDatabase();
  const transaction = database.transaction(RECORDING_STORE_NAME, 'readonly');
  const request = transaction.objectStore(RECORDING_STORE_NAME).get(recordingId);

  return waitForRequest<InterviewRecordingData | undefined>(request);
}

/** 브라우저가 지원하는 경우 면접 녹음이 임의로 정리되지 않도록 영구 저장을 요청합니다. */
export async function requestPersistentInterviewStorage() {
  if (!navigator.storage?.persist) {
    return false;
  }

  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
