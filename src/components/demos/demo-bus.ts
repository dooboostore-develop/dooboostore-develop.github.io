import { appMessage, elementDefine, innerHtml, matchedElement, onConnectedBodyShadow, publishSwcAppMessage, subscribeSwcAppMessageBehavior, eventInput } from '@dooboostore/simple-web-component';
import type { SwcAppMessage } from '@dooboostore/simple-web-component';
import { demoCard, esc, t, type DemoCopy } from './shared';

const ECHO = 'home:echo';

const COPY: DemoCopy = {
  kicker: ['Components talking to each other', '컴포넌트끼리 대화하기'],
  title: ['Zero wiring. Return a value — anyone in the app receives it.', '연결 코드 0줄. 반환하면 앱 어디서든 받습니다.'],
  cap: ['The publisher doesn\'t know who listens. The subscriber could live anywhere in the app — the header uses this for the language switch.', '발행자는 누가 듣는지 모름. 구독자는 앱 어디에 있어도 됨 — 상단 언어 전환도 이걸로 돎.'],
  code: `
@eventInput('.text-in')
@publishSwcAppMessage('home:echo')  // return = message
publish(@matchedElement input: HTMLInputElement) {
  return input.value;
}

// Behavior: late joiners get the last one
@subscribeSwcAppMessageBehavior('home:echo')
@innerHtml('.echo-out')
show(@appMessage msg: SwcAppMessage<string>) {
  return msg.data || 'Waiting for a message…';
}`,
};

export default (w: Window) => {
  const tag = 'demo-bus';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoBus extends w.HTMLElement {
    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <input class="text-in" placeholder="Type something…" autocomplete="off">
        <div class="demo-out echo-out">${t('Waiting for a message…', '메시지 기다리는 중…')}</div>`);
    }

    @eventInput('.text-in')
    @publishSwcAppMessage(ECHO)
    publish(@matchedElement input: HTMLInputElement) {
      return input.value;
    }

    @subscribeSwcAppMessageBehavior(ECHO)
    @innerHtml('.echo-out')
    show(@appMessage msg: SwcAppMessage<string>) {
      return msg?.data ? esc(msg.data) : t('Waiting for a message…', '메시지 기다리는 중…');
    }
  }
  return tag;
};
