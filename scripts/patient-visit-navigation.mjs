/** Keep the questionnaire's useful area stable; never scroll to the logo after an answer. */
export function stabilizePatientVisit(source) {
  const marker = '    // VISIT_NAVIGATION_STABLE_V1';
  if (source.includes(marker)) return source;
  const oldRender = `    function render() {
      window.scrollTo({top: 0, behavior: 'smooth'});
      if (state.phase === 'intro') renderIntro();
      else if (state.phase === 'question') renderQuestion();
      else if (state.phase === 'handoff') renderHandoff();
      else if (state.phase === 'projection') renderProjectionHandoff();
      else renderResults();
    }`;
  const newRender = `    // VISIT_NAVIGATION_STABLE_V1
    function setVisitScroll(x, y) {
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({left: x, top: Math.max(0, Math.min(y, maxY)), behavior: 'instant'});
    }

    function render() {
      const previousY = window.scrollY;
      const previousX = window.scrollX;
      const previousQuestion = app.querySelector('.question-copy');
      const previousQuestionTop = previousQuestion ? previousQuestion.getBoundingClientRect().top : null;
      if (state.phase === 'intro') renderIntro();
      else if (state.phase === 'question') renderQuestion();
      else if (state.phase === 'handoff') renderHandoff();
      else if (state.phase === 'projection') renderProjectionHandoff();
      else renderResults();

      // Preserve a content anchor, not the briefly collapsed height of a replaced DOM.
      // Range input and 'Je ne sais pas' update in place and do not call render().
      if (state.phase === 'question' && previousQuestionTop !== null) {
        const nextQuestion = app.querySelector('.question-copy');
        setVisitScroll(previousX, window.scrollY + nextQuestion.getBoundingClientRect().top - previousQuestionTop);
      } else if (state.phase === 'intro') {
        setVisitScroll(0, 0);
      } else {
        const target = app.querySelector('.question-copy, .handoff-inner, .results-head');
        setVisitScroll(previousX, target ? window.scrollY + target.getBoundingClientRect().top - 20 : previousY);
      }
      const heading = app.querySelector('.question-copy h2, .handoff-inner h1, .results-head h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({preventScroll: true});
      }
    }

    function changeResultView(view, moveToContent = false) {
      const previousY = window.scrollY;
      const previousX = window.scrollX;
      state.resultView = view;
      // Keep the header, tabs and focused tab in the DOM, replacing only the content.
      document.querySelectorAll('[data-result-view]').forEach(button => {
        const active = button.dataset.resultView === view;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      renderResultView();
      if (moveToContent) {
        const tabs = app.querySelector('.result-tabs');
        setVisitScroll(previousX, window.scrollY + tabs.getBoundingClientRect().top - 16);
        const heading = document.querySelector('#resultStage h2, #resultStage h3');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({preventScroll: true});
        }
      } else setVisitScroll(previousX, previousY);
    }`;
  const changes = [
    [oldRender, newRender],
    [`        state.resultView = button.dataset.resultView;\n        renderResults();`,
     `        changeResultView(button.dataset.resultView);`],
    [`        state.resultView = button.dataset.nextView;\n        renderResults();`,
     `        changeResultView(button.dataset.nextView, true);`]
  ];
  let result = source;
  for (const [before, after] of changes) {
    if (result.split(before).length !== 2)
      throw new Error('Structure de navigation inattendue : aucune publication.');
    result = result.replace(before, after);
  }
  return result;
}
