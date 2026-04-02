import { elementDefine, onConnectedInnerHtml, addEventListener, applyNodeHost } from '@dooboostore/simple-web-component';
import { Sim, RouterAction, RoutingDataSet } from '@dooboostore/simple-boot';
import { Router as WebRouter } from '@dooboostore/core-web';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

export default (w: Window) => {
  const tagName = 'app-package-detail-page';
  const existing = w.customElements.get(tagName);
  if (existing) return existing;

  const marked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  @Sim
  @elementDefine(tagName, { window: w })
  class PackageDetailPage extends w.HTMLElement implements RouterAction.OnRouting {
    private packageId: string = '';
    private markdownContent: string = '';
    private isLoading: boolean = false;

    constructor(private webRouter: WebRouter) {
      super();
    }

    async onRouting(url: RoutingDataSet) {
      this.packageId = url.routerModule.getPathData<{ id: string }>().id;
      await this.fetchReadme();
      this.render();
    }

    private async fetchReadme() {
      this.isLoading = true;
      this.render();
      
      const fileNames = ['README.md', 'README.MD'];
      let success = false;

      for (const fileName of fileNames) {
        try {
          const url = `https://dooboostore-develop.github.io/packages/@dooboostore/${this.packageId}/${fileName}`;
          const response = await fetch(url);
          if (response.ok) {
            const text = await response.text();
            
            // Full Documentation: [URL] 패턴 제거
            const cleanedText = text.replace(/Full Documentation:\s*https?:\/\/\S+/gi, '');
            
            this.markdownContent = marked.parse(cleanedText) as string;
            success = true;
            break;
          }
        } catch (e) {
          console.warn(`[SWC] Failed to fetch ${fileName}, trying next...`);
        }
      }

      if (!success) {
        this.markdownContent = `<div class="error"><i class="fa-solid fa-circle-exclamation"></i> Failed to load documentation for ${this.packageId}</div>`;
      }
      
      this.isLoading = false;
    }

    @applyNodeHost({ position: 'innerHtml' })
    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

        :host { display: block; background: #0F0F0F; min-height: 100vh; color: #E0E0E0; }
        .container { max-width: 1000px; margin: 0 auto; padding: 140px 40px; }
        
        .readme-content { line-height: 1.7; color: #BBB; font-size: 16px; }
        .readme-content h1, .readme-content h2, .readme-content h3 { color: #FFF; margin-top: 48px; margin-bottom: 24px; font-weight: 850; letter-spacing: -1px; }
        .readme-content h1 { font-size: 48px; border-bottom: 1px solid #2A2A2A; padding-bottom: 16px; }
        .readme-content h2 { font-size: 32px; border-left: 4px solid #FF385C; padding-left: 20px; }
        
        .readme-content code:not(.hljs) { background: rgba(255, 56, 92, 0.1); color: #FF385C; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .readme-content pre { background: #0D1117; border: 1px solid #30363d; padding: 24px; border-radius: 16px; overflow-x: auto; margin: 32px 0; }
        .readme-content pre code.hljs { background: transparent; padding: 0; border-radius: 0; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 14px; }
        
        .readme-content a { color: #FF385C; text-decoration: none; font-weight: 600; }
        .readme-content a:hover { text-decoration: underline; }

        .back-btn { display: inline-flex; align-items: center; color: #888; font-weight: 600; cursor: pointer; margin-bottom: 60px; transition: 0.2s; gap: 8px; }
        .back-btn:hover { color: #FFF; transform: translateX(-6px); }
        
        .loading { font-size: 20px; color: #888; text-align: center; padding: 100px 0; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .error { color: #FF385C; padding: 40px; background: rgba(255, 56, 92, 0.05); border: 1px solid rgba(255, 56, 92, 0.2); border-radius: 12px; text-align: center; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 12px; }

        /* Responsive */
        @media (max-width: 768px) {
          .container { padding: 100px 20px 60px; }
          .back-btn { margin-bottom: 32px; font-size: 14px; }
          .readme-content h1 { font-size: 32px; margin-top: 32px; }
          .readme-content h2 { font-size: 24px; margin-top: 24px; padding-left: 12px; }
          .readme-content pre { padding: 16px; border-radius: 12px; }
          .readme-content { font-size: 15px; }
        }
      </style>

      <div class="container">
        <div class="back-btn" id="go-back">
            <i class="fa-solid fa-arrow-left"></i> Back to Ecosystem
        </div>
        
        ${
          this.isLoading
            ? '<div class="loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Fetching latest documentation...</div>'
            : `<div class="readme-content">${this.markdownContent}</div>`
        }
      </div>
      `;
    }

    @addEventListener('#go-back', 'click', { delegate: true })
    onBack() {
      this.webRouter.go('/');
    }
  }
  return PackageDetailPage;
};
