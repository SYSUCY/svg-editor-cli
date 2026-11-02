import { readFileSync, writeFileSync } from 'node:fs';
import type { SvgDocument } from '../model/SvgDocument.js';
import { SvgParser, type SvgParseResult } from './SvgParser.js';
import { SvgSerializer } from './SvgSerializer.js';

export class SvgFileStore {
  public constructor(private readonly serializer = new SvgSerializer()) {}

  public read(path: string): SvgParseResult {
    let xml: string;
    try {
      xml = readFileSync(path, 'utf8');
    } catch {
      throw new Error(`cannot read file: ${path}`);
    }
    return new SvgParser().parse(xml, path);
  }

  public write(document: SvgDocument, path: string): void {
    try {
      writeFileSync(path, this.serializer.serialize(document), 'utf8');
    } catch {
      throw new Error(`cannot write file: ${path}`);
    }
  }
}
