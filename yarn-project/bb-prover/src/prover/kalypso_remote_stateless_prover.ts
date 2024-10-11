import { BBNativeRollupProver, type BBProverConfig } from './bb_prover.js';
import {
  AvmCircuitInputs,
  BaseParityInputs,
  BaseRollupInputs,
  BlockMergeRollupInputs,
  BlockRootRollupInputs,
  MergeRollupInputs,
  PrivateKernelEmptyInputData,
  PublicKernelCircuitPrivateInputs,
  PublicKernelInnerCircuitPrivateInputs,
  PublicKernelTailCircuitPrivateInputs,
  RootParityInputs,
  RootRollupInputs,
  TubeInputs,
} from '@aztec/circuits.js';
import { createDebugLogger } from '@aztec/foundation/log';
import { type TelemetryClient } from '@aztec/telemetry-client';

import express, { type Request, type Response } from 'express';

import { ProverInstrumentation } from '../instrumentation.js';

const logger = createDebugLogger('aztec:kalypso-remote-stateless-prover');

export class KalypsoRemoteStatelessProver {
  private app: express.Application;
  private initialized: boolean;
  private started: boolean;
  private circuitProver: BBNativeRollupProver | undefined;

  private instrumentation: ProverInstrumentation;

  constructor(
    private config: BBProverConfig,
    private telemetry: TelemetryClient,
    private daUrl: string,
    private port: number = 8001,
  ) {
    this.app = express();

    this.configureMiddleware();
    this.defineRoutes();
    this.initialized = false;
    this.started = false;

    this.instrumentation = new ProverInstrumentation(telemetry, 'BBNativeRollupProver');
  }

  get tracer() {
    return this.instrumentation.tracer;
  }

  private async initialize() {
    this.circuitProver = await BBNativeRollupProver.new(this.config, this.telemetry);
    this.initialized = true;
  }

  private configureMiddleware(): void {
    // eslint-disable-next-line import/no-named-as-default-member
    this.app.use(express.json({ limit: '10mb' }));
  }

  private defineRoutes(): void {
    this.app.get('/api/welcome', (_: Request, res: Response) => {
      res.json({ message: 'Welcome!' });
      return;
    });

    // TODO: dummy logic now
    this.app.post('/api/checkInput',  (_: Request, res: Response) => {
      res.json({ valid: true });
      return;
    });

    this.app.post('/api/getProof', async (req: Request, res: Response) => {
      try {
        const body = req.body as { public: Uint8Array };
        const idString = this.convertToId(body.public);
        logger.info('Generating Proof For Payload ID: ' + idString);

        const payloadString = await this.fetchDataFromDa(idString);
        const { method, inputs } = JSON.parse(payloadString) as { method: string; inputs: string };

        logger.warn(`Trying to generate proof for ${method}`);
        if (method === 'TEST') {
          res.json({ proof: new Uint8Array(Buffer.from('Proof not supported')) });
        } else if (method === 'BASE_PARITY_PROOF') {
          const baseParityInputs = BaseParityInputs.fromString(inputs);
          const proof = await this.circuitProver!.getBaseParityProof(baseParityInputs);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proof.toString());
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'ROOT_PARITY_PROOF') {
          const rootParityInputs = RootParityInputs.fromString(inputs);
          const proof = await this.circuitProver!.getRootParityProof(rootParityInputs);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proof?.toString());
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'BASE_ROLLUP_PROOF') {
          const baseRollupInputs = BaseRollupInputs.fromString(inputs);
          const baseRollupProof = await this.circuitProver!.getBaseRollupProof(baseRollupInputs);
          const proof = {
            circuitOutputString: baseRollupProof!.inputs.toString(),
            recursiveProofString: baseRollupProof!.proof.toString(),
            verificationKeyString: baseRollupProof!.verificationKey.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'TUBE_PROOF') {
          const tubeInputs = TubeInputs.fromString(inputs);
          const completeProof = await this.circuitProver!.getTubeProof(tubeInputs);
          const proof = {
            tubeVkString: completeProof!.tubeVK.toString(),
            recursiveProofString: completeProof!.tubeProof.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'MERGE_ROLLUP_PROOF') {
          const mergeRollupInputs = MergeRollupInputs.fromString(inputs);
          const mergeRollupProof = await this.circuitProver!.getMergeRollupProof(mergeRollupInputs);
          const proof = {
            circuitOutputString: mergeRollupProof!.inputs.toString(),
            recursiveProofString: mergeRollupProof!.proof.toString(),
            verificationKeyString: mergeRollupProof!.verificationKey.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'BLOCK_ROOT_ROLLUP_PROOF') {
          const blockRootTollupInputs = BlockRootRollupInputs.fromString(inputs);
          const blockRootRollupProof = await this.circuitProver!.getBlockRootRollupProof(blockRootTollupInputs);
          const proof = {
            circuitOutputString: blockRootRollupProof!.inputs.toString(),
            recursiveProofString: blockRootRollupProof!.proof.toString(),
            verificationKeyString: blockRootRollupProof!.verificationKey.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'BLOCK_ROOT_ROLLUP_FINAL_PROOF') {
          const blockRootRollupInputs = BlockRootRollupInputs.fromString(inputs);
          const blockRootRollupProof = await this.circuitProver!.getBlockRootRollupFinalProof(blockRootRollupInputs);
          const proof = {
            circuitOutputString: blockRootRollupProof!.inputs.toString(),
            recursiveProofString: blockRootRollupProof!.proof.toString(),
            verificationKeyString: blockRootRollupProof!.verificationKey.toString(),
          };

          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'BLOCK_MERGE_ROLLUP_PROOF') {
          const blockMergeTollupInputs = BlockMergeRollupInputs.fromString(inputs);
          const blockMergeRollupProof = await this.circuitProver!.getBlockMergeRollupProof(blockMergeTollupInputs);
          const proof = {
            circuitOutputString: blockMergeRollupProof!.inputs.toString(),
            recursiveProofString: blockMergeRollupProof!.proof.toString(),
            verificationKeyString: blockMergeRollupProof!.verificationKey.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'ROOT_ROLLUP_PROOF') {
          const rootRollupInputs = RootRollupInputs.fromString(inputs);
          const rootRollupProof = await this.circuitProver!.getRootRollupProof(rootRollupInputs);
          const proof = {
            circuitOutputString: rootRollupProof!.inputs.toString(),
            recursiveProofString: rootRollupProof!.proof.toString(),
            verificationKeyString: rootRollupProof!.verificationKey.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'PUBLIC_KERNEL_INNER_PROOF') {
          const publicKernelInnerCircuitInputs = PublicKernelInnerCircuitPrivateInputs.fromString(inputs);
          const publicKernelInnerCircuitProof =
            await this.circuitProver!.getPublicKernelInnerProof(publicKernelInnerCircuitInputs);
          const proof = {
            circuitOutputString: publicKernelInnerCircuitProof!.inputs.toString(),
            recursiveProofString: publicKernelInnerCircuitProof!.proof.toString(),
            verificationKeyString: publicKernelInnerCircuitProof!.verificationKey.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'PUBLIC_KERNEL_MERGE_PROOF') {
          const publicKernelCircuitPrivateInputs = PublicKernelCircuitPrivateInputs.fromString(inputs);
          const publicKernelCircuitPrivateProof = await this.circuitProver!.getPublicKernelMergeProof(
            publicKernelCircuitPrivateInputs,
          );

          const proof = {
            circuitOutputString: publicKernelCircuitPrivateProof!.inputs.toString(),
            recursiveProofString: publicKernelCircuitPrivateProof!.proof.toString(),
            verificationKeyString: publicKernelCircuitPrivateProof!.verificationKey.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'PUBLIC_TAIL_PROOF') {
          const publicTailInputs = PublicKernelTailCircuitPrivateInputs.fromString(inputs);
          const publicTailProof = await this.circuitProver!.getPublicTailProof(publicTailInputs);
          const proof = {
            circuitOutputString: publicTailProof?.inputs.toString(),
            recursiveProofString: publicTailProof?.proof.toString(),
            verificationKeyString: publicTailProof?.verificationKey.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'EMPTY_PRIVATE_KERNEL_PROOF') {
          const privateKernelEmptyInputData = PrivateKernelEmptyInputData.fromString(inputs);
          const privateKernelEmptyInputProof =
            await this.circuitProver!.getEmptyPrivateKernelProof(privateKernelEmptyInputData);
          const proof = {
            circuitOutputString: privateKernelEmptyInputProof?.inputs.toString(),
            recursiveProofString: privateKernelEmptyInputProof?.proof.toString(),
            verificationKeyString: privateKernelEmptyInputProof?.verificationKey.toString(),
            customData : {
              rawProof : privateKernelEmptyInputProof.proof.binaryProof.buffer.toString('hex'),
              rawVerifiedKey : privateKernelEmptyInputProof.verificationKey.keyAsBytes.toString('hex')
            }
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'EMPTY_TUBE_PROOF') {
          const privateKernelEmptyInputData = PrivateKernelEmptyInputData.fromString(inputs);
          const privateKernelEmptyInputProof = await this.circuitProver!.getEmptyTubeProof(privateKernelEmptyInputData);

          const proof = {
            circuitOutputString: privateKernelEmptyInputProof?.inputs.toString(),
            recursiveProofString: privateKernelEmptyInputProof?.proof.toString(),
            verificationKeyString: privateKernelEmptyInputProof?.verificationKey.toString(),
          };
          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else if (method === 'AVM_PROOF') {
          const avmInputs = AvmCircuitInputs.fromString(inputs);
          const avmProof = await this.circuitProver!.getAvmProof(avmInputs);

          const proof = {
            recursiveProofString: avmProof.proof.toString(),
            verificationKeyString: avmProof.proof.toString(),
          };

          const proofString = JSON.stringify(proof);
          // eslint-disable-next-line camelcase
          const proof_da_identifier = await this.storeDataInDa(proofString);
          res.json({ proof: Array.from(new Uint8Array(Buffer.from(proof_da_identifier))) });
        } else {
          res.status(404).json({ proof: new Uint8Array(Buffer.from('Proof not supported')) });
        }
      } catch (error) {
        res.status(500).json({ proof: new Uint8Array(Buffer.from('Some error')) });
      }
      return;
    });
  }

  private async fetchDataFromDa(id: string): Promise<string> {
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

  private async storeDataInDa(payload: string): Promise<string> {
    const response = await fetch(`${this.daUrl}/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData: { id: string } = await response.json();
    return responseData.id;
  }

  private convertToId(publicUint8Array: Uint8Array): string {
    const decodedString = Buffer.from(publicUint8Array).toString();
    return decodedString;
  }

  public async start(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.started) {
      throw new Error('Server already started');
    }
    this.app.listen(this.port, () => {
      this.started = true;
      logger.info(`Server is running on port ${this.port}`);
    });
  }
}
