import { TimeoutError } from '@aztec/foundation/error';
import { PriorityMemoryQueue } from '@aztec/foundation/queue';

import { type BrokerBackend } from './broker_backend/interface.js';
import type { ProofRequestConsumer, ProofRequestFilter, ProofRequestProducer } from './interface.js';
import {
  type ProofOutputs,
  type ProofRequest,
  type ProofRequestId,
  type ProofRequestStatus,
  ProofType,
} from './proof_request.js';

/**
 * A broker that manages proof requests and distributes them to workers based on their priority.
 * It takes a backend that is responsible for storing and retrieving proof requests and results.
 */
export class ProofRequestBroker implements ProofRequestProducer, ProofRequestConsumer {
  private proofPriorityComparator = (a: ProofRequest<ProofType>, b: ProofRequest<ProofType>): number => {
    if (a.proofType === b.proofType) {
      return a.blockNumber - b.blockNumber;
    } else {
      const weightA = PROOF_IMPORTANCE.indexOf(a.proofType);
      const weightB = PROOF_IMPORTANCE.indexOf(b.proofType);
      return weightA - weightB;
    }
  };

  private queues: QueueByProofType = Object.values(ProofType).reduce((acc, proofType) => {
    acc[proofType] = new PriorityMemoryQueue<ProofRequest<typeof proofType>>(this.proofPriorityComparator) as any;
    return acc;
  }, {} as QueueByProofType);

  public constructor(private backend: BrokerBackend) {}

  public async enqueueProof<T extends ProofType>(request: ProofRequest<T>): Promise<void> {
    await this.backend.saveProofRequest(request);
    this.queues[request.proofType].put(request);
    return Promise.resolve();
  }

  public cancelProof(id: ProofRequestId): Promise<void> {
    return this.backend.removeProofRequest(id);
  }

  public async getProofStatus<T extends ProofType>(id: ProofRequestId, proofType: T): Promise<ProofRequestStatus<T>> {
    const item = await this.backend.getProofRequest(id, proofType);
    if (!item) {
      return Promise.resolve({ status: 'not-found' });
    }

    const result = await this.backend.getProofResult(id, proofType);
    if (!result) {
      return Promise.resolve({ status: 'in-queue' });
    } else if ('value' in result) {
      return Promise.resolve({ status: 'resolved', value: result.value });
    } else {
      return Promise.resolve({ status: 'rejected', error: result.error });
    }
  }

  // ================== ProofRequestConsumer ==================

  async getProofRequest<T extends ProofType[]>(
    filter: ProofRequestFilter<T>,
  ): Promise<ProofRequest<T[number]> | undefined> {
    const proofTypes = filter.allowList ?? Object.values(ProofType);
    for (const proofType of proofTypes) {
      const queue = this.queues[proofType];
      try {
        const item = await queue.get(0);
        if (item) {
          return item;
        }
      } catch (err) {
        if (err instanceof TimeoutError) {
          continue;
        }
        throw err;
      }
    }

    return undefined;
  }

  reportError<T extends ProofType>(id: ProofRequestId, proofType: T, err: Error): Promise<void> {
    return this.backend.saveProofRequestError(id, proofType, err);
  }

  reportProgress<T extends ProofType[]>(
    _id: ProofRequestId,
    _filter: ProofRequestFilter<T>,
  ): Promise<ProofRequest<T[number]> | undefined> {
    return Promise.resolve(undefined);
  }

  reportResult<T extends ProofType>(id: ProofRequestId, proofType: T, result: ProofOutputs[T]): Promise<void> {
    return this.backend.saveProofRequestResult(id, proofType, result);
  }
}

type QueueByProofType = {
  [K in ProofType]: PriorityMemoryQueue<ProofRequest<K>>;
};

const PROOF_IMPORTANCE = [
  ProofType.BlockRootRollupProof,
  ProofType.BlockMergeRollupProof,
  ProofType.RootRollupProof,
  ProofType.MergeRollupProof,
  ProofType.BaseRollupProof,
  ProofType.PublicKernelSetupProof,
  ProofType.PublicKernelAppLogicProof,
  ProofType.PublicKernelTeardownProof,
  ProofType.PublicKernelTailProof,
  ProofType.AvmProof,
  ProofType.TubeProof,
  ProofType.EmptyTubeProof,
  ProofType.RootParityProof,
  ProofType.BaseParityProof,
];
