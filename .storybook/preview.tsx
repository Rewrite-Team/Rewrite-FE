import type { Preview } from '@storybook/nextjs';
import '@/shared/styles/globals.css';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',

    backgrounds: {
      options: {
        black: { name: 'black', value: '#000000' },
      },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  initialGlobals: {
    backgrounds: { value: 'black' },
  },
};

export default preview;
