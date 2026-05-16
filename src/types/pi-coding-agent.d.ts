export type AutopusPiCodingAgentSkillSourceAugmentation = never;

declare module "@earendil-works/pi-coding-agent" {
  interface Skill {
    // Autopus relies on the source identifier returned by pi skill loaders.
    source: string;
  }
}
