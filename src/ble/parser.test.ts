import type { ParsedFrame } from './types';
import { FrameAssembler, formatFrame, parseFrame, parseFrames } from './parser';

const FULL: ParsedFrame = {
  kneeAngle: 42.5,
  angularVelocity: 310,
  peakG: 4.2,
  strides: 120,
  cadence: 170,
  temperature: 31.4,
  tempDelta: 1.2,
  alertLevel: 1,
  flags: 0x05,
  battery: 3.91,
  anomalyScore: 0.12,
  anomalyType: 0,
  fusionState: 0,
  inferenceMs: 12.5,
  singleSensor: false,
  muted: true,
};

describe('parseFrame separators', () => {
  const body = 'K:42.5{s}V:310{s}P:4.2{s}S:120{s}C:170{s}T:31.4{s}D:1.2{s}N:1{s}F:005{s}B:3.91{s}A:0.12{s}Y:0{s}Z:0{s}I:12.5{s}X:0{s}U:1';

  it.each([
    ['comma', ','],
    ['semicolon', ';'],
    ['space', ' '],
    ['newline', '\n'],
    ['CRLF', '\r\n'],
    ['pipe', '|'],
    ['comma + space', ', '],
    ['tab', '\t'],
  ])('parses a full frame separated by %s', (_name, sep) => {
    const frames = parseFrames(body.replaceAll('{s}', sep));
    expect(frames).toHaveLength(1);
    expect(frames[0]).toEqual(FULL);
  });
});

describe('parseFrame tolerance', () => {
  it('returns null for missing fields', () => {
    const f = parseFrame('K:10,N:2');
    expect(f?.kneeAngle).toBe(10);
    expect(f?.alertLevel).toBe(2);
    expect(f?.peakG).toBeNull();
    expect(f?.cadence).toBeNull();
    expect(f?.temperature).toBeNull();
  });

  it('is case-insensitive and accepts "=" and spaces before the separator', () => {
    const f = parseFrame('k=12.5; v :30; n=0');
    expect(f).toMatchObject({ kneeAngle: 12.5, angularVelocity: 30, alertLevel: 0 });
  });

  it('accepts negative and decimal values', () => {
    expect(parseFrame('K:-7.25,V:-120')).toMatchObject({ kneeAngle: -7.25, angularVelocity: -120 });
  });

  it('maps NaN / null / empty values to null', () => {
    const f = parseFrame('K:nan,V:--,P:,T:null,C:170');
    expect(f).toMatchObject({ kneeAngle: null, angularVelocity: null, peakG: null, temperature: null, cadence: 170 });
  });

  it('rejects out-of-range alert levels', () => {
    expect(parseFrame('N:3,Z:7')).toMatchObject({ alertLevel: null, fusionState: null });
  });

  it('ignores unknown keys and lookalike words', () => {
    const f = parseFrame('KNEE:99,X:1,K:5');
    expect(f?.kneeAngle).toBe(5);
  });

  it('accepts wrappers like {...} and trailing noise', () => {
    expect(parseFrame('{K:1,V:2}\r\n')).toMatchObject({ kneeAngle: 1, angularVelocity: 2 });
  });

  it('decodes F as hexadecimal (firmware prints %03X)', () => {
    expect(parseFrame('F:03A')?.flags).toBe(0x3a);
    expect(parseFrame('F:1FF')?.flags).toBe(0x1ff);
    expect(parseFrame('F:0x05')?.flags).toBe(5);
    expect(parseFrame('F:ZZZ')?.flags).toBeNull();
  });

  it('treats the AI placeholders sent before the first inference as null', () => {
    const f = parseFrame('K:1.0,N:0,F:000,A:-,Y:-,Z:-,I:-');
    expect(f).toMatchObject({ kneeAngle: 1, flags: 0, anomalyScore: null, anomalyType: null, fusionState: null, inferenceMs: null });
  });

  it('parses the exact line printed by the stock firmware', () => {
    const f = parseFrame('K:42.5,V:310,P:4.2,S:120,C:85,T:31.4,D:1.2,N:1,F:009');
    expect(f).toMatchObject({ kneeAngle: 42.5, angularVelocity: 310, peakG: 4.2, strides: 120, cadence: 85, temperature: 31.4, tempDelta: 1.2, alertLevel: 1, flags: 9, battery: null, anomalyScore: null });
  });

  it('parses the full line of the patched firmware (X, U and AI fields)', () => {
    const line = 'K:42.5,V:310,P:4.2,S:120,C:85,T:31.4,D:1.2,N:1,F:009,X:0,U:1,A:0.12,Y:3,Z:1,I:12.4';
    expect(parseFrame(line)).toMatchObject({
      kneeAngle: 42.5, alertLevel: 1, flags: 9, singleSensor: false, muted: true,
      anomalyScore: 0.12, anomalyType: 3, fusionState: 1, inferenceMs: 12.4,
    });
    // Before the first inference the board sends placeholders.
    expect(parseFrame('K:1.0,N:0,F:000,X:1,U:0,A:-,Y:-,Z:-,I:-')).toMatchObject({ singleSensor: true, muted: false, anomalyScore: null, fusionState: null });
  });

  it('parses optional boolean fields', () => {
    expect(parseFrame('X:1,U:0')).toMatchObject({ singleSensor: true, muted: false });
    expect(parseFrame('X:2')?.singleSensor).toBeNull();
  });

  it('returns null / [] for garbage', () => {
    expect(parseFrame('')).toBeNull();
    expect(parseFrame('hello world')).toBeNull();
    expect(parseFrames('   \n\n')).toEqual([]);
  });
});

describe('parseFrames boundaries', () => {
  it('splits one frame per line', () => {
    const frames = parseFrames('K:1,V:2\nK:3,V:4\n');
    expect(frames.map((f) => f.kneeAngle)).toEqual([1, 3]);
  });

  it('splits glued frames when a key repeats', () => {
    const frames = parseFrames('K:1,V:2 K:3,V:4');
    expect(frames).toHaveLength(2);
    expect(frames[1]).toMatchObject({ kneeAngle: 3, angularVelocity: 4 });
  });
});

describe('formatFrame', () => {
  it('round-trips through the parser', () => {
    expect(parseFrame(formatFrame(FULL))).toEqual(FULL);
  });

  it('omits null fields and prints F like the firmware (%03X)', () => {
    expect(formatFrame({ kneeAngle: null, peakG: 3 })).toBe('P:3');
    expect(formatFrame({ flags: 0x3a })).toBe('F:03A');
  });
});

describe('FrameAssembler', () => {
  it('reassembles a frame split across MTU-sized chunks', () => {
    const a = new FrameAssembler();
    a.push('K:42.5,V:3');
    a.push('10,P:4.2');
    expect(parseFrame(a.flush() ?? '')).toMatchObject({ kneeAngle: 42.5, angularVelocity: 310, peakG: 4.2 });
  });

  it('flush clears the buffer and returns null when empty', () => {
    const a = new FrameAssembler();
    expect(a.flush()).toBeNull();
    a.push('K:1');
    a.flush();
    expect(a.flush()).toBeNull();
  });
});
