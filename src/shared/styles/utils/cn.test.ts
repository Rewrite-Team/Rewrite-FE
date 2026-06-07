import { cn } from '@/shared/styles/utils/cn';

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts', () => {
    expect(cn('px-2 text-sm', undefined, 'px-4')).toBe('text-sm px-4');
  });
});
