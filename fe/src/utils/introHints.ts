import IntroJs from 'intro.js';
import 'intro.js/introjs.css';

let intro: any;

const getStorageKey = (hint: IntroJs.Hint) => {
  return `INTRO_${String(hint.element).toUpperCase()}_CONSUMED`;
};

interface IntroHints {
  init: (hintsPayload: IntroJs.Hint[]) => void;
  remove: () => void;
}

const IntroHints: IntroHints = {
  init(hintsPayload: IntroJs.Hint[]) {
    const availableHints = hintsPayload.filter((hint: IntroJs.Hint) => {
      const consumed = localStorage.getItem(getStorageKey(hint));
      return !consumed;
    });
    const hints: IntroJs.Hint[] = availableHints.map((hint: IntroJs.Hint) => {
      return {
        element: hint.element,
        hint: hint.hint,
        hintPosition: hint.hintPosition,
      };
    });
    intro = IntroJs();
    intro.setOptions({
      hintButtonLabel: '我知道了',
      hints,
    });
    setTimeout(() => {
      intro.addHints().onhintclose((stepId: number) => {
        const hint = hintsPayload[stepId];
        localStorage.setItem(getStorageKey(hint), 'true');
      });
    }, 3000);
  },

  remove() {
    if (intro) {
      intro.removeHints();
    }
  },
};

export default IntroHints;
