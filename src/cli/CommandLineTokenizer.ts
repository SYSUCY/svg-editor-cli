export class CommandLineTokenizer {
  public tokenize(line: string): string[] | null {
    if (line.trim() === '' || line.trimStart().startsWith('#')) return null;
    const tokens: string[] = [];
    let index = 0;
    while (index < line.length) {
      while (index < line.length && /\s/.test(line[index])) index += 1;
      if (index >= line.length) break;
      if (line[index] === '"') {
        const parsed = this.quoted(line, index);
        tokens.push(parsed.value);
        index = parsed.next;
        if (index < line.length && !/\s/.test(line[index])) {
          throw new Error('unexpected characters after quoted argument');
        }
      } else {
        const start = index;
        while (index < line.length && !/\s/.test(line[index])) index += 1;
        tokens.push(line.slice(start, index));
      }
    }
    return tokens;
  }

  private quoted(line: string, start: number): { value: string; next: number } {
    let value = '';
    let index = start + 1;
    while (index < line.length) {
      const character = line[index];
      if (character === '"') return { value, next: index + 1 };
      if (character === '\\' && index + 1 < line.length && ['"', '\\'].includes(line[index + 1])) {
        index += 1;
        value += line[index];
      } else {
        value += character;
      }
      index += 1;
    }
    throw new Error('unterminated quoted argument');
  }
}
