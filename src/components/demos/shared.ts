// 랜딩 데모 카드 공통: 왼쪽 무대(직접 만져보는 곳) + 오른쪽 그 무대를 움직이는 코드.
// 데모 하나 = 커스텀 엘리먼트 하나 (이 폴더의 demo-*.ts). 무대·CSS·보여주는 코드·실제 구현이 한 파일에 있다.
// 보여주는 코드는 같은 파일의 실제 구현과 같게 유지한다 (다국어·긴 문자열·시각화용 표시 코드만 줄임).
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import { GlobalStyle } from '@/styles/GlobalStyle';

hljs.registerLanguage('typescript', typescript);
const ts = (code: string) => hljs.highlight(code.trim(), { language: 'typescript' }).value;

// 다국어 한 쌍
export const t = (en: string, ko: string) => `<span lang="en">${en}</span><span lang="ko">${ko}</span>`;
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// 각 데모의 진짜 소스 (파일 이름 = 태그 이름)
const SOURCE_BASE = 'https://github.com/dooboostore-develop/dooboostore-develop.github.io/blob/main/src/components/demos/';

export type DemoCopy = { kicker: [string, string]; title: [string, string]; cap: [string, string]; code: string };

const CARD_STYLE = `
  :host { display: block; color: #A0A0A0; font-family: 'Pretendard', sans-serif; }
  b { color: #FFF; font-weight: 700; }
  .demo { max-width: 1200px; margin: 0 auto; padding: 40px 40px 20px; }
  .demo-head { margin: 0 0 18px 6px; }
  .kicker { font-size: 12px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #FF385C; margin-bottom: 8px; }
  .demo-head h2 { font-size: 28px; font-weight: 850; letter-spacing: -1px; color: #FFF; margin: 0; }
  .demo-box { display: grid; grid-template-columns: 1fr 1.15fr; gap: 56px; align-items: center;
    padding: 40px; border: 1px solid #222; border-radius: 22px; background: #0E0E0E; }
  .demo-box > * { min-width: 0; }
  .demo-stage { text-align: center; }
  .demo-out { font-size: 22px; font-weight: 800; color: #FFF; margin: 0 0 24px; min-height: 64px; line-height: 1.5; }
  .demo-out.mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 15px; font-weight: 600; color: #DDD; min-height: 0; margin: 14px 0; }
  .demo-btn { display: inline-block; padding: 16px 34px; border-radius: 14px; font-weight: 800; font-size: 16px; cursor: pointer;
    background: #FF385C; color: #FFF; border: none; transition: 0.15s; }
  .demo-btn:hover { background: #E31C5F; }
  .demo-btn:active { transform: scale(0.96); }
  .demo-btn[disabled] { opacity: 0.5; cursor: wait; }
  .demo-btn.sm { padding: 10px 20px; font-size: 14px; border-radius: 10px; }
  .demo-btn.ghost { background: rgba(255,255,255,0.06); color: #CCC; }
  .demo-btn.ghost:hover { background: rgba(255,255,255,0.12); }
  .demo-cap { margin-top: 18px; font-size: 13px; color: #666; line-height: 1.6; }
  .meta { margin-top: 12px; font-size: 12px; color: #555; font-family: 'JetBrains Mono', monospace; }
  .text-in { width: 100%; max-width: 340px; padding: 14px 16px; border-radius: 12px; border: 1px solid #2A2A2A; background: #141414;
    color: #FFF; font-size: 16px; outline: none; margin-bottom: 18px; }
  .text-in:focus { border-color: #FF385C; }
  .scroll-box { height: 210px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 12px; max-width: 340px; margin: 0 auto;
    border: 1px dashed #2A2A2A; border-radius: 16px; }
  pre { margin: 0; background: #0D1117; border: 1px solid #22272E; border-radius: 18px; padding: 26px 28px; overflow-x: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45); }
  .src { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 13px; font-weight: 700; color: #888; text-decoration: none; }
  .src:hover { color: #FF385C; }
  pre code { background: transparent; color: #C9D1D9; padding: 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13.5px; line-height: 1.7; }
  @media (max-width: 900px) {
    .demo-box { grid-template-columns: 1fr; gap: 28px; }
  }
  @media (max-width: 768px) {
    .demo { padding-left: 20px; padding-right: 20px; }
    .demo-head h2 { font-size: 22px; }
    .demo-box { padding: 26px 20px; }
    pre { padding: 18px; }
    pre code { font-size: 12px; }
  }
`;

/** 데모 카드 한 장. tag 로 소스 링크를 건다. css 는 그 데모만의 스타일 (섀도우 안이라 다른 데모와 안 섞인다) */
export const demoCard = (tag: string, copy: DemoCopy, stage: string, css = '') => `
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <style>${GlobalStyle}${CARD_STYLE}${css}</style>
  <section class="demo">
    <div class="demo-head">
      <div class="kicker">${t(copy.kicker[0], copy.kicker[1])}</div>
      <h2>${t(copy.title[0], copy.title[1])}</h2>
    </div>
    <div class="demo-box">
      <div class="demo-stage">
        ${stage}
        <div class="demo-cap">${t(copy.cap[0], copy.cap[1])}</div>
      </div>
      <div>
        <pre><code class="hljs language-typescript">${ts(copy.code)}</code></pre>
        <a class="src" href="${SOURCE_BASE}${tag}.ts" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> ${t(`Full source: ${tag}.ts`, `전체 소스 보기: ${tag}.ts`)}</a>
      </div>
    </div>
  </section>`;
