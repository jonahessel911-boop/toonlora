export interface PipelineContext {
  maxPanels?: number;
  singleEpisode?: boolean;
  generateCover?: boolean;
  generateEpisodeNumbers?: number[];
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

/** Queue launch: plan full series, episode 1 panel count fixed, generate episode 1 only. */
export function isSeriesLaunchMode(): boolean {
  return (
    Boolean(activeContext.maxPanels) &&
    !activeContext.singleEpisode &&
    (activeContext.generateEpisodeNumbers?.length ?? 0) > 0
  );
}

export function getGenerateEpisodeNumbers(): number[] | undefined {
  return activeContext.generateEpisodeNumbers;
}

export function shouldGenerateCover(): boolean {
  return activeContext.generateCover === true;
}
