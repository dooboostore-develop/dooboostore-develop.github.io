/**
 * Global Styles for Shadow DOM Components
 * Includes FontAwesome and common reset styles
 */
export const GlobalStyle = `
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
  
  :host {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * { box-sizing: border-box; }

  i {
    font-style: normal;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* 다국어: body[data-lang] → CSS 변수 → 섀도우 안까지 상속.
     [lang] 래퍼는 블록 요소로만 쓸 것 (fallback block). */
  [lang="en"] { display: var(--show-en, block); }
  [lang="ko"] { display: var(--show-ko, block); }
`;
