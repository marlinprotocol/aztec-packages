import {
  makePublicInputsAndRecursiveProof,
  type AvmProofAndVerificationKey,
  type PublicInputsAndRecursiveProof,
  type PublicInputsAndTubeProof,
  type ServerCircuitProver,
} from '@aztec/circuit-types';
import {
  BaseOrMergeRollupPublicInputs,
  BlockRootOrBlockMergePublicInputs,
  KernelCircuitPublicInputs,
  PublicKernelCircuitPublicInputs,
  RecursiveProof,
  RootParityInput,
  RootRollupPublicInputs,
  VerificationKeyData,
  VMCircuitPublicInputs,
  type BaseParityInputs,
  type RECURSIVE_PROOF_LENGTH,
  type RootParityInputs,
  type NESTED_RECURSIVE_PROOF_LENGTH,
  type BaseRollupInputs,
  type TubeInputs,
  type MergeRollupInputs,
  type BlockRootRollupInputs,
  type BlockMergeRollupInputs,
  type RootRollupInputs,
  type PublicKernelInnerCircuitPrivateInputs,
  type PublicKernelCircuitPrivateInputs,
  type PublicKernelTailCircuitPrivateInputs,
  type PrivateKernelEmptyInputData,
  type AvmCircuitInputs,
  Proof,
  AvmVerificationKeyData,
  type TUBE_PROOF_LENGTH,
} from '@aztec/circuits.js';
import { type BBNativeRollupProver } from './bb_prover.js';
import { Attributes, type TelemetryClient, trackSpan } from '@aztec/telemetry-client';
import { ProverInstrumentation } from '../instrumentation.js';
import { createDebugLogger } from '@aztec/foundation/log';
const logger = createDebugLogger('aztec:kalypso-delegated-prover');

interface KalypsoRequest {
  askId: string;
  blockNumber: number;
}

interface ProofId {
  complete: boolean
  proof_da_identifier: string;
}

export class KalypsoDelegatedProver implements ServerCircuitProver {
  private actualProver: ActualProver;
  private instrumentation: ProverInstrumentation;
  constructor(
    private backupProver: BBNativeRollupProver | undefined,
    telemetry: TelemetryClient,
    private daUrl: string,
    private requestingServiceEndpoint: string,
    private queryingServiceEndpoint: string,
  ) {
    this.actualProver = new ActualProver(this.daUrl, this.requestingServiceEndpoint, this.queryingServiceEndpoint);
    this.instrumentation = new ProverInstrumentation(telemetry, 'KalypsoDelegatedProver');
  }

  get tracer() {
    return this.instrumentation.tracer;
  }

  @trackSpan('KalypsoDelegatedProver.getBaseParityProof', { [Attributes.PROTOCOL_CIRCUIT_NAME]: 'base-parity' })
  async getBaseParityProof(
    inputs: BaseParityInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<RootParityInput<typeof RECURSIVE_PROOF_LENGTH>> {
    try {
      return await this.actualProver.getBaseParityProof(inputs);
    } catch (error) {
      logger.warn('Failed getBaseParityProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getBaseParityProof(inputs);
    }
  }

  @trackSpan('KalypsoDelegatedProver.getRootParityProof', { [Attributes.PROTOCOL_CIRCUIT_NAME]: 'root-parity' })
  async getRootParityProof(
    inputs: RootParityInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<RootParityInput<typeof NESTED_RECURSIVE_PROOF_LENGTH>> {
    try {
      return await this.actualProver.getRootParityProof(inputs);
    } catch (error) {
      logger.warn('Failed getRootParityProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getRootParityProof(inputs);
    }
  }

  async getBaseRollupProof(
    baseRollupInput: BaseRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BaseOrMergeRollupPublicInputs>> {
    try {
      return await this.actualProver.getBaseRollupProof(baseRollupInput);
    } catch (error) {
      logger.warn('Failed getBaseRollupProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getBaseRollupProof(baseRollupInput);
    }
  }

  async getTubeProof(
    tubeInput: TubeInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<{ tubeVK: VerificationKeyData; tubeProof: RecursiveProof<typeof RECURSIVE_PROOF_LENGTH> }> {
    try {
      return await this.actualProver.getTubeProof(tubeInput);
    } catch (error) {
      logger.warn('Failed getTubeProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getTubeProof(tubeInput);
    }
  }

  async getMergeRollupProof(
    input: MergeRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BaseOrMergeRollupPublicInputs>> {
    try {
      return await this.actualProver.getMergeRollupProof(input);
    } catch (error) {
      logger.error('Failed getMergeRollupProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getMergeRollupProof(input);
    }
  }

  async getBlockRootRollupProof(
    input: BlockRootRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BlockRootOrBlockMergePublicInputs>> {
    try {
      return await this.actualProver.getBlockRootRollupProof(input);
    } catch (error) {
      logger.error('Failed getBlockRootRollupProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getBlockRootRollupProof(input);
    }
  }

  async getBlockRootRollupFinalProof(
    input: BlockRootRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BlockRootOrBlockMergePublicInputs>> {
    try {
      return await this.actualProver.getBlockRootRollupFinalProof(input);
    } catch (error) {
      logger.error('Failed getBlockRootRollupProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getBlockRootRollupFinalProof(input);
    }
  }

  async getBlockMergeRollupProof(
    input: BlockMergeRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BlockRootOrBlockMergePublicInputs>> {
    try {
      return await this.actualProver.getBlockMergeRollupProof(input);
    } catch (error) {
      logger.error('Failed getBlockMergeRollupProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getBlockMergeRollupProof(input);
    }
  }

  async getRootRollupProof(
    input: RootRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<RootRollupPublicInputs>> {
    try {
      return await this.actualProver.getRootRollupProof(input);
    } catch (error) {
      logger.error('Failed getRootRollupProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getRootRollupProof(input);
    }
  }

  @trackSpan('KalypsoDelegatedProver.getPublicKernelInnerProof', {
    [Attributes.PROTOCOL_CIRCUIT_NAME]: 'public-kernel-inner',
  })
  async getPublicKernelInnerProof(
    inputs: PublicKernelInnerCircuitPrivateInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<VMCircuitPublicInputs>> {
    try {
      return await this.actualProver.getPublicKernelInnerProof(inputs);
    } catch (error) {
      logger.error('Failed getPublicKernelInnerProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getPublicKernelInnerProof(inputs);
    }
  }

  @trackSpan('KalypsoDelegatedProver.getPublicKernelMergeProof', {
    [Attributes.PROTOCOL_CIRCUIT_NAME]: 'public-kernel-merge',
  })
  async getPublicKernelMergeProof(
    inputs: PublicKernelCircuitPrivateInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<PublicKernelCircuitPublicInputs>> {
    try {
      return await this.actualProver.getPublicKernelMergeProof(inputs);
    } catch (error) {
      logger.error('Failed getPublicKernelMergeProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getPublicKernelMergeProof(inputs);
    }
  }

  async getPublicTailProof(
    inputs: PublicKernelTailCircuitPrivateInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<KernelCircuitPublicInputs>> {
    try {
      return await this.actualProver.getPublicTailProof(inputs);
    } catch (error) {
      logger.error('Failed getPublicTailProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getPublicTailProof(inputs);
    }
  }

  async getEmptyPrivateKernelProof(
    inputs: PrivateKernelEmptyInputData,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<KernelCircuitPublicInputs>> {
    try {
      return await this.actualProver.getEmptyPrivateKernelProof(inputs);
    } catch (error) {
      logger.error('Failed getEmptyPrivateKernelProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getEmptyPrivateKernelProof(inputs);
    }
  }

  async getEmptyTubeProof(
    inputs: PrivateKernelEmptyInputData,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndTubeProof<KernelCircuitPublicInputs>> {
    try {
      return await this.actualProver.getEmptyTubeProof(inputs);
    } catch (error) {
      logger.error('Failed getEmptyTubeProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getEmptyTubeProof(inputs);
    }
  }

  @trackSpan('KalypsoDelegatedProver.getAvmProof', inputs => ({ [Attributes.APP_CIRCUIT_NAME]: inputs.functionName }))
  async getAvmProof(
    inputs: AvmCircuitInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<AvmProofAndVerificationKey> {
    try {
      return await this.actualProver.getAvmProof(inputs);
    } catch (error) {
      logger.error('Failed getBlockRootRollupProof from Kalypso');
      if (!this.backupProver) {
        throw error;
      }
      return await this.backupProver.getAvmProof(inputs);
    }
  }
}

class ActualProver implements ServerCircuitProver {
  constructor(
    private daUrl: string,
    private requestingServiceEndpoint: string,
    private queryingServiceEndpoint: string,
  ) {}

  async fetchDataFromDa(id: string): Promise<string> {
    const response = await fetch(`${this.daUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData: { payload: string } = await response.json();
    return responseData.payload;
  }

  async retry<T extends ProofId>(fn: () => Promise<T>, retries: number, interval: number): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Attempt to execute the function
        const result = await fn();
        if (result.complete && result.proof_da_identifier){
          return result
        }else{
          throw new Error("Proof not complete yet")
        }
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          // Wait for the specified interval before retrying
          await this.delay(interval);
          logger.warn(`Attempt ${attempt + 1} failed. Retrying in ${interval}ms...`);
        }
      }
    }

    // All retry attempts failed; throw the last encountered error
    throw lastError;
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async queryProofFromKalypso(kalypsoRequest: KalypsoRequest): Promise<ProofId> {
    try {
      const response = await fetch(this.queryingServiceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kalypsoRequest),
      });

      if (!response.ok) {
        logger.error('queryProofFromKalypso: ' + response.status);
        throw new Error(`HTTP error! Status: ${response.status}\nBody: ${response.body}`);
      }

      const responseData: ProofId = await response.json();
      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error querying proof info from Kalypso server: ', error.message);
      } else {
        logger.error('Error querying proof info from Kalypso server: ', error);
      }
      throw new Error(`Error in POST request: ${error}`);
    }
  }

  async submitRequestToKalypsoServer<T>(payload: T): Promise<KalypsoRequest> {
    try {
      const response = await fetch(this.requestingServiceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logger.error('postRequestToKalypsoServer: ' + response.status);
        throw new Error(`HTTP error! Status: ${response.status}\nBody: ${response.body}`);
      }

      const responseData: KalypsoRequest = await response.json();
      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error posting info to Kalypso server: ', error.message);
      } else {
        logger.error('Error posting info to Kalypso server: ', error);
      }
      throw new Error(`Error in POST request: ${error}`);
    }
  }

  async getBaseParityProof(
    inputs: BaseParityInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<RootParityInput<typeof RECURSIVE_PROOF_LENGTH>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'BASE_PARITY_PROOF',
      inputs: inputs.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);
    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const toReturn = RootParityInput.fromString<typeof RECURSIVE_PROOF_LENGTH>(proof);
    return toReturn;
  }

  async getRootParityProof(
    inputs: RootParityInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<RootParityInput<typeof NESTED_RECURSIVE_PROOF_LENGTH>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'ROOT_PARITY_PROOF',
      inputs: inputs.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);
    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const toReturn = RootParityInput.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(proof);
    return toReturn;
  }

  async getBaseRollupProof(
    baseRollupInput: BaseRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BaseOrMergeRollupPublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'BASE_ROLLUP_PROOF',
      inputs: baseRollupInput.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);
    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = BaseOrMergeRollupPublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getTubeProof(
    tubeInput: TubeInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<{ tubeVK: VerificationKeyData; tubeProof: RecursiveProof<typeof RECURSIVE_PROOF_LENGTH> }> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'TUBE_PROOF',
      inputs: tubeInput.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 1500000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { tubeVkString, recursiveProofString } = JSON.parse(proof) as {
      tubeVkString: string;
      recursiveProofString: string;
    };
    return {
      tubeVK: VerificationKeyData.fromString(tubeVkString),
      tubeProof: RecursiveProof.fromString<typeof TUBE_PROOF_LENGTH>(recursiveProofString),
    };
  }

  async getMergeRollupProof(
    input: MergeRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BaseOrMergeRollupPublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'MERGE_ROLLUP_PROOF',
      inputs: input.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = BaseOrMergeRollupPublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getBlockRootRollupProof(
    input: BlockRootRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BlockRootOrBlockMergePublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'BLOCK_ROOT_ROLLUP_PROOF',
      inputs: input.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = BlockRootOrBlockMergePublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getBlockRootRollupFinalProof(
    input: BlockRootRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BlockRootOrBlockMergePublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'BLOCK_ROOT_ROLLUP_FINAL_PROOF',
      inputs: input.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = BlockRootOrBlockMergePublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getBlockMergeRollupProof(
    input: BlockMergeRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<BlockRootOrBlockMergePublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'BLOCK_MERGE_ROLLUP_PROOF',
      inputs: input.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = BlockRootOrBlockMergePublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getRootRollupProof(
    input: RootRollupInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<RootRollupPublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'ROOT_ROLLUP_PROOF',
      inputs: input.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = RootRollupPublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getPublicKernelInnerProof(
    inputs: PublicKernelInnerCircuitPrivateInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<VMCircuitPublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'PUBLIC_KERNEL_INNER_PROOF',
      inputs: inputs.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = VMCircuitPublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getPublicKernelMergeProof(
    inputs: PublicKernelCircuitPrivateInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<PublicKernelCircuitPublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'PUBLIC_KERNEL_MERGE_PROOF',
      inputs: inputs.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = PublicKernelCircuitPublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getPublicTailProof(
    inputs: PublicKernelTailCircuitPrivateInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<KernelCircuitPublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'PUBLIC_TAIL_PROOF',
      inputs: inputs.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = KernelCircuitPublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getEmptyPrivateKernelProof(
    inputs: PrivateKernelEmptyInputData,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndRecursiveProof<KernelCircuitPublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'EMPTY_PRIVATE_KERNEL_PROOF',
      inputs: inputs.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = KernelCircuitPublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getEmptyTubeProof(
    inputs: PrivateKernelEmptyInputData,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<PublicInputsAndTubeProof<KernelCircuitPublicInputs>> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'EMPTY_TUBE_PROOF',
      inputs: inputs.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 120000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { circuitOutputString, recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      circuitOutputString: string;
      recursiveProofString: string;
      verificationKeyString: string;
    };

    const circuitOutput = KernelCircuitPublicInputs.fromString(circuitOutputString);
    const recursiveProof = RecursiveProof.fromString<typeof NESTED_RECURSIVE_PROOF_LENGTH>(recursiveProofString);
    const verificationKey = VerificationKeyData.fromString(verificationKeyString);

    return makePublicInputsAndRecursiveProof(circuitOutput, recursiveProof, verificationKey);
  }

  async getAvmProof(
    inputs: AvmCircuitInputs,
    _signal?: AbortSignal,
    _epochNumber?: number,
  ): Promise<AvmProofAndVerificationKey> {
    // eslint-disable-next-line camelcase
    const kalypsoRequest = await this.submitRequestToKalypsoServer<{ method: string; inputs: string }>({
      method: 'AVM_PROOF',
      inputs: inputs.toString(),
    });

    // eslint-disable-next-line camelcase
    const { proof_da_identifier } = await this.retry(() => this.queryProofFromKalypso(kalypsoRequest), 12345, 5000);

    const proof = await this.fetchDataFromDa(proof_da_identifier);
    const { recursiveProofString, verificationKeyString } = JSON.parse(proof) as {
      recursiveProofString: string;
      verificationKeyString: string;
    };

    return {
      proof: Proof.fromString(recursiveProofString),
      verificationKey: AvmVerificationKeyData.fromString(verificationKeyString),
    };
  }
}
