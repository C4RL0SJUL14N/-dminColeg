import { AsyncLocalStorage } from 'async_hooks';
import { AuditRequestContextState } from './audit.types';

const auditAsyncStorage = new AsyncLocalStorage<AuditRequestContextState>();

export function runAuditContext<T>(state: AuditRequestContextState, callback: () => T): T {
  return auditAsyncStorage.run(state, callback);
}

export function getAuditContext(): AuditRequestContextState | undefined {
  return auditAsyncStorage.getStore();
}

export function setAuditEntityId(entityId: string | null | undefined): void {
  const store = getAuditContext();
  if (store) {
    store.entityId = entityId ?? null;
  }
}

export function setAuditBeforeState(value: unknown): void {
  const store = getAuditContext();
  if (store) {
    store.before = value;
  }
}

export function setAuditAfterState(value: unknown): void {
  const store = getAuditContext();
  if (store) {
    store.after = value;
  }
}

export function mergeAuditMetadata(metadata: Record<string, unknown>): void {
  const store = getAuditContext();
  if (store) {
    store.metadata = { ...(store.metadata ?? {}), ...metadata };
  }
}

