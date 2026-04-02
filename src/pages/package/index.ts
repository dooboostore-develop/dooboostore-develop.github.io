import { attribute, elementDefine, innerHtmlLight, innerHtml, mutationObserver, onConnectedAfter, onConnectedBefore, onConnectedBodyShadow, eventClickDelegate } from "@dooboostore/simple-web-component";
import { Inject } from '@dooboostore/simple-boot';
import { Router } from '@dooboostore/core-web';
import { createMarked, runMermaid } from '@/utils/markdown';
import { RepositoryService } from '../../services/RepositoryService';
import { findPackage, packageMeta, SITE_URL } from '@/data/packages';
import { GlobalStyle } from '@/styles/GlobalStyle';

export default (w: Window) => {
  const tagName = 'app-package-detail-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  const marked = createMarked();

  @elementDefine(tagName, { window: w })
  class PackageDetailPage extends w.HTMLElement {
    private hasExamples = ['simple-web-component'];
    @attribute('package-id')
    private packageId?: string;
    private githubBaseUrl = 'https://github.com/dooboostore-develop/packages/tree/main/@dooboostore';
    private router: Router;

    private repoService: RepositoryService;

    @onConnectedAfter
    onconstructor(router: Router, @Inject(RepositoryService.SYMBOL) repoService: RepositoryService) {
      this.router = router;
      this.repoService = repoService;
      this.loadPackage(this.packageId);
    }


    // SSG 때 서버에서 실행돼 패키지별 HTML의 <head>에 박힌다
    @onConnectedBefore
    @innerHtml((c, helper) => helper.$w.document.querySelector('title'), { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:title"]'), 'content', { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:url"]'), 'content', { valueKey: 'url' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:image"]'), 'content', { valueKey: 'ogImage' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:title"]'), 'content', { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:image"]'), 'content', { valueKey: 'ogImage' })
    @attribute((c, helper) => helper.$w.document.querySelector('link[rel="canonical"]'), 'href', { valueKey: 'url' })
    setPageMeta() {
      const meta = packageMeta(this.packageId ?? '');
      return {
        title: meta.title,
        description: meta.description,
        url: SITE_URL + meta.path,
        ogImage: this.packageId
          ? `${SITE_URL}/assets/images/${this.packageId}-og.png`
          : `${SITE_URL}/assets/dooboostore.png`,
      };
    }

    private loadPackage(id: string) {
        this.renderHeader(id);
        this.renderSummary(id);
        this.fetchReadme(id);
    }

    @innerHtml('.summary', { root: 'shadow' })
    renderSummary(packageId: string) {
      const pkg = findPackage(packageId);
      if (!pkg) return '';
      const code = (t: string) => t.replace(/`([^`]+)`/g, '<code>$1</code>');
      return `
        <div class="pkg-name">@dooboostore/${pkg.id}</div>
        <div class="pkg-tagline"><span lang="en">${pkg.tagline}</span><span lang="ko">${pkg.taglineKo}</span></div>
        ${pkg.highlights?.length ? `<ul class="pkg-highlights">${pkg.highlights.map((h, i) => `<li><span lang="en">${code(h)}</span><span lang="ko">${code((pkg.highlightsKo ?? [])[i] ?? h)}</span></li>`).join('')}</ul>` : ''}
      `;
    }


    @onConnectedBodyShadow
    render() {
      return `
      <style>
        ${GlobalStyle}
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

        .summary { margin-bottom: 28px; }
        .pkg-name { font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #FF385C; margin-bottom: 12px; }
        .pkg-tagline { font-size: 34px; font-weight: 850; letter-spacing: -1.2px; color: #FFF; line-height: 1.2; }
        .pkg-highlights { margin: 26px 0 0; padding: 22px 26px 22px 44px; background: #141414; border: 1px solid #222; border-radius: 14px; }
        .pkg-highlights li { color: #AAA; line-height: 1.7; margin: 6px 0; }
        .pkg-highlights li::marker { color: #FF385C; }
        .summary code { background: rgba(255, 56, 92, 0.1); color: #FF6B86; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }

        @media (max-width: 768px) {
          .container { padding: 40px 20px 60px; }
          .header-actions { flex-direction: column; align-items: flex-start; gap: 20px; margin-bottom: 32px; }
          .external-links { flex-direction: column; align-items: stretch; }
          .link-btn { justify-content: center; }
        }
      </style>
      <div class="container">
        <div class="header-actions"></div>
        <div class="summary"></div>
        <div class="external-links"></div>
        <slot></slot>
      </div>
      `;
    }

    @innerHtml('.header-actions', { root: 'shadow' })
    renderHeader(packageId: string) {
      return `
        <div class="back-btn" id="go-back">
            <i class="fa-solid fa-arrow-left"></i> <span lang="en">Back to Ecosystem</span><span lang="ko">생태계로 돌아가기</span>
        </div>
        ${this.hasExamples.includes(packageId) ? `
            <button class="link-btn primary" id="go-examples">
                <i class="fa-solid fa-play"></i> <span lang="en">Run Interactive Examples</span><span lang="ko">인터랙티브 예제 실행</span>
            </button>
        ` : ''}
      `;
    }

    @innerHtml('.external-links', { root: 'shadow' })
    renderExternalLinks(packageId: string) {
      const repoUrl = `${this.githubBaseUrl}/${packageId}`;
      const exampleUrl = `${repoUrl}/example/src`;
      
      return `
        <a href="${repoUrl}" target="_blank" class="link-btn">
          <i class="fa-brands fa-github"></i> <span lang="en">View Repository</span><span lang="ko">저장소 보기</span>
        </a>
      `;
    }

    @innerHtmlLight({
      fallback: () => `<div class="loading-container"><i class="fa-solid fa-circle-notch fa-spin"></i> <span lang="en">Fetching latest documentation...</span><span lang="ko">최신 문서를 가져오는 중...</span></div>`
    })
    async fetchReadme(packageId: string) {
      try {
        const text = await this.repoService.getReadme(packageId);
        const cleanedText = text.replace(/Full Documentation:\s*https?:\/\/\S+/gi, '');
        this.renderExternalLinks(packageId); // Update links too
        return `<div class="readme-content">${marked.parse(cleanedText)}</div>`;
      } catch (e) {
        return `<div class="error-container"><i class="fa-solid fa-circle-exclamation"></i> <span lang="en">Failed to load documentation for ${packageId}</span><span lang="ko">${packageId} 문서를 불러오지 못했습니다</span></div>`;
      }
    }

    // README가 늦게 들어오므로 DOM 삽입 시점에 mermaid 실행 (없으면 no-op, SSR no-op)
    @mutationObserver('.readme-content', { childList: true, subtree: true, delegate: true })
    async onReadmeRendered() {
      await runMermaid(this);
    }

    @eventClickDelegate('#go-back')
    onBack() { this.router.go('/'); }

    @eventClickDelegate('#go-examples')
    onGoExamples() { this.router.go(`/package/${this.packageId}/examples`); }
  }
  return tagName;
};
