import * as fs from 'fs';
import * as path from 'path';

const CONFIG_PATH = path.resolve(__dirname, '../../.coderabbit.yaml');

function readConfig(): string {
  return fs.readFileSync(CONFIG_PATH, 'utf-8');
}

/**
 * Minimal line-based YAML value extractor for flat and nested keys.
 * Supports: top-level "key: value" and indented "  key: value" pairs.
 * Returns the raw string value (trimmed, quotes stripped) or null if not found.
 */
function getYamlValue(content: string, ...keyPath: string[]): string | null {
  const lines = content.split('\n');
  let depth = 0;
  let lineIndex = 0;

  for (const key of keyPath) {
    const indent = '  '.repeat(depth);
    const pattern = new RegExp(`^${indent}${key}:\\s*(.*)$`);

    while (lineIndex < lines.length) {
      const match = lines[lineIndex].match(pattern);
      lineIndex++;
      if (match) {
        const value = match[1].trim();
        if (value !== '') {
          // Leaf value found — strip optional surrounding quotes
          return value.replace(/^['"]|['"]$/g, '');
        }
        // Key found but value is on child lines — advance depth and continue
        depth++;
        break;
      }
    }
  }

  return null;
}

/**
 * Returns all list items (lines starting with "- ") under the given key path.
 */
function getYamlListItems(content: string, ...keyPath: string[]): string[] {
  const lines = content.split('\n');
  let depth = 0;
  let lineIndex = 0;

  for (const key of keyPath) {
    const indent = '  '.repeat(depth);
    const pattern = new RegExp(`^${indent}${key}:\\s*$`);

    let found = false;
    while (lineIndex < lines.length) {
      if (lines[lineIndex].match(pattern)) {
        lineIndex++;
        depth++;
        found = true;
        break;
      }
      lineIndex++;
    }
    if (!found) return [];
  }

  const itemIndent = '  '.repeat(depth);
  const items: string[] = [];
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (line.match(new RegExp(`^${itemIndent}-\\s+(.+)$`))) {
      const itemMatch = line.match(new RegExp(`^${itemIndent}-\\s+(.+)$`));
      if (itemMatch) {
        items.push(itemMatch[1].trim().replace(/^['"]|['"]$/g, ''));
      }
      lineIndex++;
    } else if (line.trim() === '' || line.startsWith(itemIndent)) {
      lineIndex++;
    } else {
      break;
    }
  }

  return items;
}

describe('.coderabbit.yaml 설정 파일 유효성 검사', () => {
  describe('파일 존재 및 접근성', () => {
    it('파일이 존재해야 한다', () => {
      expect(fs.existsSync(CONFIG_PATH)).toBe(true);
    });

    it('읽기 가능해야 한다', () => {
      expect(() => readConfig()).not.toThrow();
    });

    it('비어 있지 않아야 한다', () => {
      const content = readConfig();
      expect(content.trim().length).toBeGreaterThan(0);
    });

    it('스키마 참조 주석을 포함해야 한다', () => {
      const content = readConfig();
      expect(content).toContain(
        '# yaml-language-server: $schema=https://coderabbit.ai/integrations/schema.v2.json',
      );
    });
  });

  describe('최상위 설정', () => {
    it('language가 ko-KR이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'language')).toBe('ko-KR');
    });

    it('early_access가 false이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'early_access')).toBe('false');
    });
  });

  describe('reviews 설정', () => {
    it('profile이 chill이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'reviews', 'profile')).toBe('chill');
    });

    it('high_level_summary가 true이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'reviews', 'high_level_summary')).toBe('true');
    });

    it('poem이 false이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'reviews', 'poem')).toBe('false');
    });

    it('review_status가 true이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'reviews', 'review_status')).toBe('true');
    });

    it('collapse_walkthrough가 false이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'reviews', 'collapse_walkthrough')).toBe('false');
    });
  });

  describe('reviews.auto_review 설정', () => {
    it('enabled가 true이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'reviews', 'auto_review', 'enabled')).toBe('true');
    });

    it('drafts가 false이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'reviews', 'auto_review', 'drafts')).toBe('false');
    });

    it('base_branches에 dev 브랜치 패턴이 포함되어야 한다', () => {
      const content = readConfig();
      const branches = getYamlListItems(content, 'reviews', 'auto_review', 'base_branches');
      expect(branches).toContain('^dev$');
    });

    it('base_branches가 정규식 패턴이어야 한다 (^dev$ 형식)', () => {
      const content = readConfig();
      const branches = getYamlListItems(content, 'reviews', 'auto_review', 'base_branches');
      expect(branches.length).toBeGreaterThan(0);
      // ^dev$ should be a valid regex
      expect(() => new RegExp(branches[0])).not.toThrow();
      expect(new RegExp(branches[0]).test('dev')).toBe(true);
      expect(new RegExp(branches[0]).test('develop')).toBe(false);
      expect(new RegExp(branches[0]).test('feature/dev')).toBe(false);
    });
  });

  describe('chat 설정', () => {
    it('auto_reply가 true이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'chat', 'auto_reply')).toBe('true');
    });
  });

  describe('knowledge_base 설정', () => {
    it('opt_out이 false이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'knowledge_base', 'opt_out')).toBe('false');
    });

    it('code_guidelines.enabled가 true이어야 한다', () => {
      const content = readConfig();
      expect(getYamlValue(content, 'knowledge_base', 'code_guidelines', 'enabled')).toBe('true');
    });

    it('filePatterns에 AGENTS.md가 포함되어야 한다', () => {
      const content = readConfig();
      const patterns = getYamlListItems(
        content,
        'knowledge_base',
        'code_guidelines',
        'filePatterns',
      );
      expect(patterns).toContain('AGENTS.md');
    });

    it('filePatterns에 docs/ARCHITECTURE.md가 포함되어야 한다', () => {
      const content = readConfig();
      const patterns = getYamlListItems(
        content,
        'knowledge_base',
        'code_guidelines',
        'filePatterns',
      );
      expect(patterns).toContain('docs/ARCHITECTURE.md');
    });

    it('filePatterns에 docs/CONVENTIONS.md가 포함되어야 한다', () => {
      const content = readConfig();
      const patterns = getYamlListItems(
        content,
        'knowledge_base',
        'code_guidelines',
        'filePatterns',
      );
      expect(patterns).toContain('docs/CONVENTIONS.md');
    });

    it('filePatterns에 정확히 3개의 항목이 있어야 한다', () => {
      const content = readConfig();
      const patterns = getYamlListItems(
        content,
        'knowledge_base',
        'code_guidelines',
        'filePatterns',
      );
      expect(patterns).toHaveLength(3);
    });
  });

  describe('구조적 무결성', () => {
    it('최상위 섹션(reviews, chat, knowledge_base)이 모두 존재해야 한다', () => {
      const content = readConfig();
      expect(content).toMatch(/^reviews:/m);
      expect(content).toMatch(/^chat:/m);
      expect(content).toMatch(/^knowledge_base:/m);
    });

    it('탭 문자를 사용하지 않아야 한다 (YAML은 스페이스 들여쓰기 사용)', () => {
      const content = readConfig();
      expect(content).not.toMatch(/\t/);
    });

    it('줄 끝에 불필요한 공백이 없어야 한다', () => {
      const lines = readConfig().split('\n');
      const linesWithTrailingSpace = lines.filter((line) => /\s+$/.test(line));
      expect(linesWithTrailingSpace).toHaveLength(0);
    });

    it('파일이 개행 문자로 끝나야 한다', () => {
      const content = readConfig();
      expect(content).toMatch(/\n$/);
    });
  });
});
