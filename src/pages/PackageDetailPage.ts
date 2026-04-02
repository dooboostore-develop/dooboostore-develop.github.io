import {elementDefine, onConnectedInnerHtml, addEventListener, applyInnerHtmlNodeHost, applyInnerHtmlNode, onDisconnected, onInitialize, attributeHost, onAfterConnected} from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import { Router } from '@dooboostore/core-web';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { RepositoryService } from '../services/RepositoryService';

export default (w: Window) => {
  const tagName = 'app-package-detail-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  const marked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  @elementDefine(tagName, { window: w })
  class PackageDetailPage extends w.HTMLElement {
    private hasExamples = ['simple-web-component'];
    @attributeHost('package-id')
    private packageId: string = '';
    private githubBaseUrl = 'https://github.com/dooboostore-develop/packages/tree/main/@dooboostore';
    private router: Router;

    private repoService: RepositoryService;

    @onInitialize
    onconstructor(router: Router, @Inject({symbol: RepositoryService.SYMBOL}) repoService: RepositoryService) {
      this.router = router;
      this.repoService = repoService;
      this.loadPackage(this.packageId);
    }

    private loadPackage(id: string) {
        this.renderHeader(id);
        this.fetchReadme(id);
    }


    @onAfterConnected
    t() {
      this.loadPackage(this.packageId);
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <style>
        :host { 
          display: block;
          background: #0F0F0F; 
          min-height: 100vh; 
          color: #E0E0E0; 
          box-sizing: border-box;
        }
        * { box-sizing: border-box; }
        .container { max-width: 1000px; margin: 0 auto; padding: 60px 40px; }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; min-height: 50px; }
        .back-btn { display: inline-flex; align-items: center; color: #888; font-weight: 600; cursor: pointer; transition: 0.2s; gap: 8px; }
        .back-btn:hover { color: #FFF; transform: translateX(-6px); }
        
        .external-links { display: flex; gap: 12px; align-items: center; margin-bottom: 40px; padding: 20px; background: #161616; border-radius: 12px; border: 1px solid #222; flex-wrap: wrap; }
        .link-btn { 
            padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; border: 1px solid #333; 
            font-size: 13px; display: flex; align-items: center; gap: 8px; transition: 0.2s; text-decoration: none; color: #BBB;
            background: #1A1A1A;
        }
        .link-btn:hover { background: #252525; color: #FFF; border-color: #444; transform: translateY(-2px); }
        .link-btn.primary { background: #FF385C; color: white; border: none; }
        .link-btn.primary:hover { background: #E31C5F; box-shadow: 0 8px 16px rgba(255, 56, 92, 0.2); }
        .link-btn i { font-size: 16px; }

        @media (max-width: 768px) {
          .container { padding: 40px 20px 60px; }
          .header-actions { flex-direction: column; align-items: flex-start; gap: 20px; margin-bottom: 32px; }
          .external-links { flex-direction: column; align-items: stretch; }
          .link-btn { justify-content: center; }
        }
      </style>
      <div class="container">
        <div class="header-actions"></div>
        <div class="external-links"></div>
        <slot></slot>
      </div>
      `;
    }

    @applyInnerHtmlNode('.header-actions', { root: 'shadow' })
    renderHeader(packageId: string) {
      console.log('hhhhhhh')
      return `
        <div class="back-btn" id="go-back">
            <i class="fa-solid fa-arrow-left"></i> Back to Ecosystem
        </div>
        ${this.hasExamples.includes(packageId) ? `
            <button class="link-btn primary" id="go-examples">
                <i class="fa-solid fa-play"></i> Run Interactive Examples
            </button>
        ` : ''}
      `;
    }

    @applyInnerHtmlNode('.external-links', { root: 'shadow' })
    renderExternalLinks(packageId: string) {
      const repoUrl = `${this.githubBaseUrl}/${packageId}`;
      const exampleUrl = `${repoUrl}/example/src`;
      
      return `
        <a href="${repoUrl}" target="_blank" class="link-btn">
          <i class="fa-brands fa-github"></i> View Repository
        </a>
      `;
    }

    @applyInnerHtmlNodeHost({ 
      root: 'light',
      loading: () => `<div class="loading-container"><i class="fa-solid fa-circle-notch fa-spin"></i> Fetching latest documentation...</div>`
    })
    async fetchReadme(packageId: string) {
      try {
        const text = await this.repoService.getReadme(packageId);
        const cleanedText = text.replace(/Full Documentation:\s*https?:\/\/\S+/gi, '');
        this.renderExternalLinks(packageId); // Update links too
        return `<div class="readme-content">${marked.parse(cleanedText)}</div>`;
      } catch (e) {
        return `<div class="error-container"><i class="fa-solid fa-circle-exclamation"></i> Failed to load documentation for ${packageId}</div>`;
      }
    }

    @addEventListener('#go-back', 'click', { delegate: true })
    onBack() { this.router.go('/'); }

    @addEventListener('#go-examples', 'click', { delegate: true })
    onGoExamples() { this.router.go(`/package/${this.packageId}/examples`); }
  }
  return tagName;
};
