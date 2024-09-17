import assert from 'assert/strict';

import type { ProofOutputs, ProofRequest, ProofRequestId, ProofType } from '../proof_request.js';
import { type BrokerBackend } from './interface.js';

export class InMemoryBrokerBackend implements BrokerBackend {
  private items = new Map<ProofRequestId, ProofRequest<ProofType>>();
  private results = new Map<ProofRequestId, { value: unknown } | { error: Error }>();

  saveProofRequest<T extends ProofType>(request: ProofRequest<T>): Promise<void> {
    if (this.items.has(request.id)) {
      const existing = this.items.get(request.id);
      assert.deepStrictEqual(existing, request, 'Conflicting proof request ID');
      return Promise.resolve();
    }

    this.items.set(request.id, request);
    return Promise.resolve();
  }

  saveProofRequestResult<T extends ProofType>(
    id: ProofRequestId,
    proofType: T,
    result: ProofOutputs[T],
  ): Promise<void> {
    assert.equal(this.items.get(id)?.proofType, proofType, 'Proof type mismatch');
    this.results.set(id, { value: result });
    return Promise.resolve();
  }

  saveProofRequestError<T extends ProofType>(id: ProofRequestId, proofType: T, err: Error): Promise<void> {
    assert.equal(this.items.get(id)?.proofType, proofType, 'Proof type mismatch');
    this.results.set(id, { error: err });
    return Promise.resolve();
  }

  getProofRequest<T extends ProofType>(id: ProofRequestId): ProofRequest<T> | undefined {
    return this.items.get(id) as ProofRequest<T>;
  }

  getProofResult<T extends ProofType>(
    id: ProofRequestId,
    proofType: T,
  ): { value: ProofOutputs[T] } | { error: Error } | undefined {
    assert.equal(this.items.get(id)?.proofType, proofType, 'Proof type mismatch');
    return this.results.get(id) as any;
  }

  removeProofRequest(id: ProofRequestId): Promise<void> {
    this.items.delete(id);
    return Promise.resolve();
  }
}
