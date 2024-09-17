import { RECURSIVE_PROOF_LENGTH } from '@aztec/circuits.js';
import { makeBaseParityInputs, makeBaseRollupInputs, makeRootParityInput } from '@aztec/circuits.js/testing';

import { ProofRequestBroker } from './broker.js';
import { InMemoryBrokerBackend } from './broker_backend/in_memory.js';
import { type ProofRequest, ProofType, makeProofRequestId } from './proof_request.js';

describe('ProofRequestBroker', () => {
  let broker: ProofRequestBroker;

  beforeEach(() => {
    broker = new ProofRequestBroker(new InMemoryBrokerBackend());
  });

  it('enqueues proof requests', async () => {
    const proofRequest: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    const anotherProofRequest: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 2,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    const yetAnotherProofRequest: ProofRequest<ProofType.BaseRollupProof> = {
      id: makeProofRequestId(),
      blockNumber: 3,
      proofType: ProofType.BaseRollupProof,
      inputs: makeBaseRollupInputs(),
    };

    await broker.enqueueProof(proofRequest);
    await broker.enqueueProof(anotherProofRequest);
    await broker.enqueueProof(yetAnotherProofRequest);

    expect(await broker.getProofStatus(proofRequest.id, proofRequest.proofType)).toEqual({ status: 'in-queue' });
    expect(await broker.getProofStatus(anotherProofRequest.id, anotherProofRequest.proofType)).toEqual({
      status: 'in-queue',
    });
    expect(await broker.getProofStatus(yetAnotherProofRequest.id, yetAnotherProofRequest.proofType)).toEqual({
      status: 'in-queue',
    });
  });

  it('panics if the expected proof type does not match the actual proof type', async () => {
    const proofRequest: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    await broker.enqueueProof(proofRequest);
    await expect(broker.getProofStatus(proofRequest.id, ProofType.BaseRollupProof)).rejects.toThrow(
      'Proof type mismatch',
    );
  });

  it('silently ignores duplicates', async () => {
    const proofRequest: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    await broker.enqueueProof(proofRequest);
    await broker.enqueueProof(proofRequest);

    expect(await broker.getProofStatus(proofRequest.id, proofRequest.proofType)).toEqual({ status: 'in-queue' });
  });

  it('panics if two proof requests have the same ID', async () => {
    const proofRequest: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    await broker.enqueueProof(proofRequest);

    const anotherProofRequest: ProofRequest<ProofType.BaseRollupProof> = {
      id: proofRequest.id, // same ID
      blockNumber: 2,
      proofType: ProofType.BaseRollupProof,
      inputs: makeBaseRollupInputs(),
    };

    await expect(broker.enqueueProof(anotherProofRequest)).rejects.toThrow('Conflicting proof request ID');
  });

  it('returns not-found status for non-existing proof request', async () => {
    const status = await broker.getProofStatus(makeProofRequestId(), ProofType.BaseParityProof);
    expect(status).toEqual({ status: 'not-found' });
  });

  it('should cancel proof request', async () => {
    const proofRequest: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    await broker.enqueueProof(proofRequest);
    await broker.cancelProof(proofRequest.id);

    const status = await broker.getProofStatus(proofRequest.id, proofRequest.proofType);
    expect(status).toEqual({ status: 'not-found' });
  });

  it('offers proof requests in priority order', async () => {
    const proofRequest1: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    const proofRequest2: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 2,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    const proofRequest3: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 3,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    await broker.enqueueProof(proofRequest2);
    await broker.enqueueProof(proofRequest3);
    await broker.enqueueProof(proofRequest1);

    const proofRequest = await broker.getProofRequest({ allowList: [ProofType.BaseParityProof] });
    expect(proofRequest).toEqual(proofRequest1);
  });

  it('offers proof requests in priority order and respects allowList', async () => {
    const proofRequest1: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    const proofRequest2: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 2,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    const proofRequest3: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 3,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    await broker.enqueueProof(proofRequest2);
    await broker.enqueueProof(proofRequest3);
    await broker.enqueueProof(proofRequest1);

    const proofRequest = await broker.getProofRequest({ allowList: [ProofType.BaseRollupProof] });
    expect(proofRequest).toBeUndefined();
  });

  it('returns undefined if no proof requests are available', async () => {
    const proofRequest = await broker.getProofRequest({ allowList: [ProofType.BaseParityProof] });
    expect(proofRequest).toBeUndefined();
  });

  it('returns undefined if no proof requests are available for the given allowList', async () => {
    const proofRequest: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    await broker.enqueueProof(proofRequest);

    const proofRequest2 = await broker.getProofRequest({ allowList: [ProofType.BaseRollupProof] });
    expect(proofRequest2).toBeUndefined();
  });

  it('reports proof results', async () => {
    const proofRequest: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    await broker.enqueueProof(proofRequest);
    const value = makeRootParityInput(RECURSIVE_PROOF_LENGTH);
    await broker.reportResult(proofRequest.id, proofRequest.proofType, value);

    const status = await broker.getProofStatus(proofRequest.id, proofRequest.proofType);
    expect(status).toEqual({ status: 'resolved', value });
  });

  it('reports proof errors', async () => {
    const proofRequest: ProofRequest<ProofType.BaseParityProof> = {
      id: makeProofRequestId(),
      blockNumber: 1,
      proofType: ProofType.BaseParityProof,
      inputs: makeBaseParityInputs(),
    };

    await broker.enqueueProof(proofRequest);
    const error = new Error('test error');
    await broker.reportError(proofRequest.id, proofRequest.proofType, error);

    const status = await broker.getProofStatus(proofRequest.id, proofRequest.proofType);
    expect(status).toEqual({ status: 'rejected', error });
  });
});
