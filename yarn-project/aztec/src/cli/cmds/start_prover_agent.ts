// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BBNativeRollupProver, KalypsoDelegatedProver, TestCircuitProver } from '@aztec/bb-prover';
import { type ServerCircuitProver } from '@aztec/circuit-types';
import { type ProverClientConfig, proverClientConfigMappings } from '@aztec/prover-client';
import {
  ProverAgent,
  createProverAgentRpcServer,
  createProvingJobSourceClient,
} from '@aztec/prover-client/prover-agent';
import {
  type TelemetryClientConfig,
  createAndStartTelemetryClient,
  telemetryClientConfigMappings,
} from '@aztec/telemetry-client/start';

import { type ServiceStarter, extractRelevantOptions } from '../util.js';

export const startProverAgent: ServiceStarter = async (options, signalHandlers, logger) => {
  const proverConfig = extractRelevantOptions<ProverClientConfig>(options, proverClientConfigMappings, 'prover');

  if (!proverConfig.nodeUrl) {
    throw new Error('Starting prover without an orchestrator is not supported');
  }

  logger(`Connecting to prover at ${proverConfig.nodeUrl}`);
  const source = createProvingJobSourceClient(proverConfig.nodeUrl, 'provingJobSource');

  const telemetryConfig = extractRelevantOptions<TelemetryClientConfig>(options, telemetryClientConfigMappings, 'tel');
  const telemetry = await createAndStartTelemetryClient(telemetryConfig);

  let circuitProver: ServerCircuitProver;
  if (proverConfig.realProofs) {
    if (!proverConfig.acvmBinaryPath || !proverConfig.bbBinaryPath) {
      throw new Error('Cannot start prover without simulation or native prover options');
    }
    // const backupProver = await BBNativeRollupProver.new(proverConfig, telemetry);
    const daUrl = "http://88.198.12.137:8080";
    const provingServerEndPoint = "http://88.198.12.137:9001/directProof";

    circuitProver = new KalypsoDelegatedProver(undefined, telemetry, daUrl, provingServerEndPoint);
  } else {
    circuitProver = new TestCircuitProver(telemetry, undefined, proverConfig);
  }

  const agent = new ProverAgent(
    circuitProver,
    proverConfig.proverAgentConcurrency,
    proverConfig.proverAgentPollInterval,
  );
  agent.start(source);
  logger(`Started prover agent with concurrency limit of ${proverConfig.proverAgentConcurrency}`);

  signalHandlers.push(() => agent.stop());

  return [{ prover: createProverAgentRpcServer(agent) }];
};