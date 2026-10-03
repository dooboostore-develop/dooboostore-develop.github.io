import demoClick from './demo-click';
import demoSearch from './demo-search';
import demoFetch from './demo-fetch';
import demoChase from './demo-chase';
import demoClock from './demo-clock';
import demoBus from './demo-bus';
import demoReveal from './demo-reveal';
import demoFeed from './demo-feed';
import demoHooks from './demo-hooks';
import demoInject from './demo-inject';
import demoObservers from './demo-observers';
import demoLeak from './demo-leak';

// 랜딩에 나오는 순서 그대로 (demo-leak 은 랜딩에서 따로 아래쪽에 둔다)
export const LANDING_DEMOS = ['demo-click', 'demo-search', 'demo-fetch', 'demo-chase', 'demo-clock', 'demo-bus', 'demo-reveal', 'demo-feed', 'demo-hooks', 'demo-inject', 'demo-observers'];

export const demoFactories = [demoClick, demoSearch, demoFetch, demoChase, demoClock, demoBus, demoReveal, demoFeed, demoHooks, demoInject, demoObservers, demoLeak];
