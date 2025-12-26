import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ScrollTo
window.scrollTo = vi.fn();

// Mock console.error to keep output clean (optional, can be removed if debugging)
// const originalError = console.error;
// console.error = (...args) => {
//   if (/Warning: ReactDOM.render is no longer supported/.test(args[0])) return;
//   originalError(...args);
// };
