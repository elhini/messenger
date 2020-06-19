import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders Send button', () => {
  const { getByText } = render(<App />);
  const btnElement = getByText(/Send/i);
  expect(btnElement).toBeInTheDocument();
});
