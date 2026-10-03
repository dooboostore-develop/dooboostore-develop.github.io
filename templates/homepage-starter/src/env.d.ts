// 컴포넌트를 (w: Window) => … 팩토리로 만들어 브라우저 window 와 빌드 때 쓰는 서버 쪽 DOM(window) 양쪽에 등록한다.
// 그래서 w.HTMLElement 를 쓰는데, TypeScript 기본 Window 타입엔 없어서 알려준다.
interface Window {
  HTMLElement: typeof HTMLElement;
}
