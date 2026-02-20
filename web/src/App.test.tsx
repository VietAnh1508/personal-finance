import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the baseline headline', () => {
    render(<App />);
    expect(screen.getByText(/react spa baseline/i)).toBeInTheDocument();
  });
});
