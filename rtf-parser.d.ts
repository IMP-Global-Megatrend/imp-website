declare module 'rtf-parser' {
  import type { Transform } from 'node:stream'

  function parse(cb: (err: Error | null, doc: unknown) => void): Transform

  namespace parse {
    function string(str: string, cb: (err: Error | null, doc: unknown) => void): void
    function stream(stream: NodeJS.ReadableStream, cb: (err: Error | null, doc: unknown) => void): void
  }

  export = parse
}
