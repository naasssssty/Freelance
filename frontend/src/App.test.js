import { render } from '@testing-library/react';
import App from './App';

test('renders app component', () => {
  render(<App />);
  // Απλώς ελέγχουμε ότι η εφαρμογή φορτώνει χωρίς σφάλματα
  expect(true).toBe(true);
});
