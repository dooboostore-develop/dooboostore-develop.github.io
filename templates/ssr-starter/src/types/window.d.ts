// 컴포넌트를 (w: Window) => … 팩토리로 만들어 브라우저 window 와 서버 쪽 DOM(window) 양쪽에 등록한다.
interface Window {
  HTMLElement: typeof HTMLElement;
}
