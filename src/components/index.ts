import AppHeader from './AppHeader';
import { demoFactories } from './demos';

export * from './AppHeader';

export const componentFactories = [
  AppHeader,
  ...demoFactories,
];
