import worker from '../../dist/server/index.js';

export default async function handler(request) {
  const executionContext = {
    waitUntil(promise) {
      Promise.resolve(promise).catch(console.error);
    },
    passThroughOnException() {},
  };

  return worker.fetch(request, {}, executionContext);
}

