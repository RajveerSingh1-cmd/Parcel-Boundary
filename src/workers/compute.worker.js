import { parseCoordinates } from '../utils/parser.js';
import { findClosestPair } from '../utils/closestPair.js';

self.onmessage = function (e) {
  const { type, payload } = e.data;

  if (type === 'parse') {
    try {
      self.postMessage({ type: 'status', message: 'Parsing file...' });
      const result = parseCoordinates(payload.text);
      self.postMessage({ type: 'parseResult', data: result });
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message });
    }
  }

  if (type === 'compute') {
    try {
      self.postMessage({ type: 'status', message: 'Computing closest pair...' });
      const start = performance.now();
      const result = findClosestPair(payload.points);
      const elapsed = performance.now() - start;
      self.postMessage({
        type: 'computeResult',
        data: { ...result, computeTime: elapsed },
      });
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message });
    }
  }
};
