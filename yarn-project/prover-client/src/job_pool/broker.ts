import { TimeoutError } from '@aztec/foundation/error';
import { createDebugLogger } from '@aztec/foundation/log';
import { RunningPromise } from '@aztec/foundation/promise';
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

type InProgressMetadata = {
  id: ProofRequestId;
  type: ProofType;
  startedAt: number;
  lastUpdatedAt: number;
};

type ProofRequestBrokerConfig = {
  timeoutIntervalMs?: number;
  proofRequestTimeoutMs?: number;
};

/**
 * A broker that manages proof requests and distributes them to workers based on their priority.
 * It takes a backend that is responsible for storing and retrieving proof requests and results.
 */
export class ProofRequestBroker implements ProofRequestProducer, ProofRequestConsumer {
  private queues: QueueByProofType = Object.values(ProofType).reduce((acc, proofType) => {
    acc[proofType] = new PriorityMemoryQueue<ProofRequest<typeof proofType>>(proofPriorityComparator) as any;
    return acc;
  }, {} as QueueByProofType);

  private inProgress = new Map<ProofRequestId, InProgressMetadata>();
  private timeoutPromise: RunningPromise;
  private timeSource = performance.now;
  private proofRequestTimeoutMs: number;

  public constructor(
    private backend: BrokerBackend,
    { proofRequestTimeoutMs = 30_000, timeoutIntervalMs = 10_000 }: ProofRequestBrokerConfig = {},
    private logger = createDebugLogger('aztec:prover-client:proof-request-broker'),
  ) {
    this.timeoutPromise = new RunningPromise(this.timeoutCheck, timeoutIntervalMs);
    this.proofRequestTimeoutMs = proofRequestTimeoutMs;
  }

  public start(): void {
    this.timeoutPromise.start();
  }

  public stop(): Promise<void> {
    return this.timeoutPromise.stop();
  }

  public async enqueueProof<T extends ProofType>(request: ProofRequest<T>): Promise<void> {
    await this.backend.saveProofRequest(request);
    this.queues[request.proofType].put(request);

    this.logger.debug(`Enqueued new proof request id=${request.id} type=${request.proofType}`);

    return Promise.resolve();
  }

  public cancelProof(id: ProofRequestId): Promise<void> {
    this.logger.info(`Cancelling proof request id=${id}`);
    return this.backend.removeProofRequest(id);
  }

  public async getProofStatus<T extends ProofType>(id: ProofRequestId, proofType: T): Promise<ProofRequestStatus<T>> {
    const item = await this.backend.getProofRequest(id, proofType);
    if (!item) {
      this.logger.warn(`Proof request id=${id} type=${proofType} not found`);
      return Promise.resolve({ status: 'not-found' });
    }

    const result = await this.backend.getProofResult(id, proofType);
    if (!result) {
      return Promise.resolve({ status: this.inProgress.has(id) ? 'in-progress' : 'in-queue' });
    } else if ('value' in result) {
      return Promise.resolve({ status: 'resolved', value: result.value });
    } else {
      return Promise.resolve({ status: 'rejected', error: result.error });
    }
  }

  // ================== ProofRequestConsumer ==================

  getProofRequest<T extends ProofType[]>(filter: ProofRequestFilter<T>): Promise<ProofRequest<T[number]> | undefined> {
    const proofTypes = filter.allowList ?? Object.values(ProofType);
    for (const proofType of proofTypes) {
      const queue = this.queues[proofType];
      const item = queue.getInstant();
      if (item) {
        this.inProgress.set(item.id, {
          id: item.id,
          type: item.proofType,
          startedAt: this.timeSource(),
          lastUpdatedAt: this.timeSource(),
        });

        return Promise.resolve(item);
      }
    }

    return Promise.resolve(undefined);
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

  private timeoutCheck = async () => {
    for (const [id, metadata] of this.inProgress.entries()) {
      const item = this.backend.getProofRequest(id, metadata.type);
      if (!item) {
        this.logger.warn(`Proof request id=${id} type=${metadata.type} not found. Removing it from the queue.`);
        this.inProgress.delete(id);
        continue;
      }

      const elapsedSinceLastUpdate = this.timeSource() - metadata.lastUpdatedAt;
      if (elapsedSinceLastUpdate > this.proofRequestTimeoutMs) {
        this.logger.warn(`Proof request id=${id} type=${metadata.type} timed out. Adding it back to the queue.`);
        this.inProgress.delete(id);
        await this.enqueueProof(item);
      }
    }
  };
}

type QueueByProofType = {
  [K in ProofType]: PriorityMemoryQueue<ProofRequest<K>>;
};

function proofPriorityComparator(a: ProofRequest<ProofType>, b: ProofRequest<ProofType>): number {
  if (a.proofType === b.proofType) {
    return a.blockNumber - b.blockNumber;
  } else {
    const weightA = PROOF_IMPORTANCE.indexOf(a.proofType);
    const weightB = PROOF_IMPORTANCE.indexOf(b.proofType);
    return weightA - weightB;
  }
}

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
