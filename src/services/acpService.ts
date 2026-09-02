import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import {
  AcpProviderId,
  AgentEvent,
  KryptonSpec,
  ProviderInfo,
} from '../types/acp';

export class AcpService {
  static async listProviders(): Promise<ProviderInfo[]> {
    return invoke<ProviderInfo[]>('acp_list_providers');
  }

  static async startSession(
    provider: AcpProviderId,
    customCmd?: string,
    customArgs?: string[],
    workspacePath?: string
  ): Promise<string> {
    return invoke<string>('acp_start_session', {
      provider,
      customCmd,
      customArgs,
      workspacePath,
    });
  }

  static async terminateSession(sessionId: string): Promise<void> {
    return invoke('acp_terminate_session', { sessionId });
  }

  static async sendPrompt(sessionId: string, prompt: string): Promise<void> {
    return invoke('acp_send_prompt', { sessionId, prompt });
  }

  static async generateKryptonSpec(
    provider: AcpProviderId,
    prompt: string,
    workspacePath?: string
  ): Promise<KryptonSpec> {
    return invoke<KryptonSpec>('krypton_generate_spec', { provider, prompt, workspacePath });
  }

  static async runKryptonSpec(specId: string, workspacePath?: string): Promise<void> {
    return invoke('krypton_run_spec', { specId, workspacePath });
  }

  static async approveCheckpoint(checkpointId: string): Promise<void> {
    return invoke('krypton_approve_checkpoint', { checkpointId });
  }

  static async rejectCheckpoint(checkpointId: string, reason: string): Promise<void> {
    return invoke('krypton_reject_checkpoint', { checkpointId, reason });
  }

  static async onEvent(callback: (event: AgentEvent) => void): Promise<UnlistenFn> {
    return listen<AgentEvent>('acp-event', (e) => {
      callback(e.payload);
    });
  }
}
