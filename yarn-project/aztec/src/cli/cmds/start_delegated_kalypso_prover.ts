import { proverClientConfigMappings, type ProverClientConfig } from "@aztec/prover-client";
import { KalypsoRemoteStatelessProver } from "@aztec/bb-prover";
import { extractRelevantOptions, type ServiceStarter } from "../util.js";
import { createAndStartTelemetryClient, type TelemetryClientConfig, telemetryClientConfigMappings } from "@aztec/telemetry-client/start";

export const startDelegatedKalypsoStatelessProver: ServiceStarter = async (options, _signalHandlers, logger) => {
  const proverConfig = extractRelevantOptions<ProverClientConfig>(options, proverClientConfigMappings, 'prover');

  const telemetryConfig = extractRelevantOptions<TelemetryClientConfig>(options, telemetryClientConfigMappings, 'tel');
  const telemetry = await createAndStartTelemetryClient(telemetryConfig);

  logger(`Starting to delegated prover at`);
  const kalypsoRemoteProver = new KalypsoRemoteStatelessProver(proverConfig, telemetry, "http://88.198.12.137:8080");

  await kalypsoRemoteProver.start()
  return [];
}