import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { App } from './App';

describe('App', () => {
  it('renders Ale Tale title', async () => {
    render(<App />);
    expect(screen.getByText(/Ale Tale/)).toBeInTheDocument();
  });
});
