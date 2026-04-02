// 다국어 메시지 버스 타입 — AUTH_CHANGED(labelcatch) 같은 패턴.
// 발행: AppBody 최초 1회 + 언어 전환 시 / 구독: @subscribeSwcAppMessage(LANG_CHANGED, { subject: 'behavior' })
export const LANG_CHANGED = 'showcase:lang-changed';

export type Lang = 'en' | 'ko';

const STORAGE_KEY = 'showcase:lang';

export const resolveInitialLang = (w: Window): Lang => {
  try {
    const stored = w.localStorage?.getItem(STORAGE_KEY);
    if (stored === 'ko' || stored === 'en') return stored;
  } catch {
    // SSR / 사설모드 — 무시하고 다음으로
  }
  try {
    const nav = w.navigator?.language as string | undefined;
    if (nav?.toLowerCase().startsWith('ko')) return 'ko';
  } catch {
    // dom-parser window에 navigator 없음 — 무시
  }
  return 'en';
};

export const persistLang = (w: Window, lang: Lang): void => {
  try {
    w.localStorage?.setItem(STORAGE_KEY, lang);
  } catch {
    // 저장 실패 — 무시하고 메모리 상태로만 동작
  }
};
