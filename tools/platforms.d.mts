export interface Platform {
  readonly target: string;
  readonly os: string;
  readonly cpu: string;
  readonly packageName: string;
  readonly directory: string;
  readonly binary: string;
  readonly loaderPlatform: string;
}

export const platforms: readonly Platform[];

export function platformForHost(os?: string, cpu?: string): Platform | undefined;
