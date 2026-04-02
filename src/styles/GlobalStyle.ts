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
`;
