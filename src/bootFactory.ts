import register from '@dooboostore/simple-web-component';
import { serviceFactories } from './services';
import { componentFactories } from "./components";
import { pageFactories } from "./pages";

export default (w: Window, container: symbol) => {
  serviceFactories.forEach(s => s(container));
  
  // Register all pages, components, and root router
  register(w, [...pageFactories, ...componentFactories]);
};
