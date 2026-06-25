export interface PipelineContext {
  maxPanels?: number;
  singleEpisode?: boolean;
  generateCover?: boolean;
}

let activeContext: PipelineContext = {};

export function setPipelineContext(context: PipelineContext): void {
  activeContext = { ...context };
}

export function clearPipelineContext(): void {
  activeContext = {};
}

export function getPipelineContext(): PipelineContext {
  return activeContext;
}

export function getPipelineMaxPanels(): number | undefined {
  return activeContext.maxPanels;
}

export function isSingleEpisodeMode(): boolean {
  return activeContext.singleEpisode === true;
}

export function shouldGenerateCover(): boolean {
  return activeContext.generateCover === true;
}
