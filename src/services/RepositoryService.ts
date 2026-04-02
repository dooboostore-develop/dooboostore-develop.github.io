import {Sim} from '@dooboostore/simple-boot';
import {ConstructorType} from "@dooboostore/core";

export namespace RepositoryService {
  export const SYMBOL = Symbol('RepositoryService');
  
  export interface GithubContent {
    name: string;
    path: string;
    type: 'file' | 'dir';
    download_url: string | null;
  }
}

export interface RepositoryService {
  getReadme(packageId: string): Promise<string>;
  getLocalDoc(path: string): Promise<string>;
  getExampleDirectories(packageId: string): string[];
  getExampleFiles(packageId: string, dirName: string): Promise<RepositoryService.GithubContent[]>;
  getRawText(packageId: string, dirName: string, fileName: string): Promise<string>;
}

export default (container: symbol): ConstructorType<any> => {
  @Sim({symbol: RepositoryService.SYMBOL, container: container})
  class RepositoryServiceImp implements RepositoryService {
    private rawBaseUrl = 'https://raw.githubusercontent.com/dooboostore-develop/packages/main';
    private githubApiBase = 'https://api.github.com/repos/dooboostore-develop/packages/contents';

    // Static mapping to avoid GitHub API Rate Limit for directory listing
    private structure: Record<string, string[]> = {
      'core': ['advice', 'di', 'proxy', 'reflect', 'schedule'],
      'core-node': ['fs', 'scanner', 'start'],
      'simple-boot': ['di', 'lifecycle', 'start'],
      'simple-boot-front': ['start'],
      'simple-boot-http-server': ['middleware', 'routing', 'start'],
      'simple-web-component': ['examples']
    };

    async getReadme(packageId: string): Promise<string> {
      const readmeVariants = ['README.md', 'README.MD'];
      for (const variant of readmeVariants) {
        try {
          const url = `${this.rawBaseUrl}/@dooboostore/${packageId}/${variant}`;
          const response = await fetch(url);
          if (response.ok) return await response.text();
        } catch (e) {
          console.warn(`[RepositoryService] Failed to fetch ${packageId}/${variant}`);
        }
      }
      throw new Error(`Could not find README for ${packageId}`);
    }

    async getLocalDoc(path: string): Promise<string> {
      const response = await fetch(`/assets/docs/${path}`);
      if (response.ok) return await response.text();
      throw new Error(`Could not find local doc: ${path}`);
    }

    getExampleDirectories(packageId: string): string[] {
      return this.structure[packageId] || [];
    }

    /**
     * Fetching file list still requires API, but we'll minimize it.
     * In the future, this can also be staticized.
     */
    async getExampleFiles(packageId: string, dirName: string): Promise<RepositoryService.GithubContent[]> {
      const path = `@dooboostore/${packageId}/example/src/${dirName}`;
      const response = await fetch(`${this.githubApiBase}/${path}?ref=main`);
      if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
      return await response.json();
    }

    async getRawText(packageId: string, dirName: string, fileName: string): Promise<string> {
      const url = `${this.rawBaseUrl}/@dooboostore/${packageId}/example/src/${dirName}/${fileName}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Fetch error: ${response.statusText}`);
      return await response.text();
    }
  }

  return RepositoryServiceImp;
}
