// Log only fixed stages and validated error codes, never SDK error objects/URLs.
export function authTrace(stage, error) {
  const code = /^(?:[a-z-]+\/)?[a-z-]+$/.test(error?.code || '') ? error.code : 'unknown';
  console.info(`[AUTH] ${stage}${error ? ` ${code}` : ''}`);
}

export function createLoginFlow({start, begin, end, subscribe, timeoutMs = 120000}) {
  let active;
  return () => {
    if (active) return active;
    active = (async () => {
      let timer, unsubscribe = () => {}, attempt, finished = false;
      const close = id => { Promise.resolve().then(() => end(id)).catch(() => authTrace('POPUP_CLEANUP_FAILED')); };
      try {
        authTrace('AUTH_START');
        const failure = new Promise((_, reject) => {
          timer = setTimeout(() => reject(Object.assign(new Error('로그인이 완료되지 않았습니다. 다시 시도해 주세요.'), {code: 'auth/timeout'})), timeoutMs);
          unsubscribe = subscribe(event => {
            if (!attempt || event.attempt !== attempt || !event.code) return;
            reject(Object.assign(new Error('인증 창에서 로그인을 완료하지 못했습니다.'), {code: event.code}));
          });
        });
        const operation = (async () => {
          attempt = await begin();
          if (finished) { close(attempt); return; }
          return start();
        })();
        const result = await Promise.race([operation, failure]);
        authTrace('AUTH_RESULT_RECEIVED');
        return result;
      } catch (error) {
        authTrace('AUTH_FAILED', error);
        throw error;
      } finally {
        finished = true;
        clearTimeout(timer); unsubscribe();
        // Ending the attempt closes its popup and lets Firebase observe closure.
        if (attempt) close(attempt);
      }
    })().finally(() => { active = undefined; });
    return active;
  };
}
