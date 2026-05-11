import React from 'react';
import { describe, expect, it } from 'vitest';
import { recursiveCloneChildren } from '../react';

// Helper: create a component with a displayName
function makeComponent(displayName: string) {
  const C = ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children);
  C.displayName = displayName;
  return C;
}

const Target = makeComponent('Target');
const Other = makeComponent('Other');

describe('recursiveCloneChildren', () => {
  it('returns null when children is null', () => {
    const result = recursiveCloneChildren(null, {}, ['Target'], 'uid');
    expect(result).toBeNull();
  });

  it('passes through non-element children unchanged', () => {
    const result = recursiveCloneChildren('plain text', {}, ['Target'], 'uid');
    // React.Children.map wraps in an array
    expect(result).toEqual(['plain text']);
  });

  it('injects additionalProps into matching displayName elements', () => {
    const child = React.createElement(Target, null);
    const result = recursiveCloneChildren(child, { 'data-injected': true }, ['Target'], 'uid') as React.ReactElement<
      Record<string, unknown>
    >[];
    expect(result[0].props['data-injected']).toBe(true);
  });

  it('does not inject additionalProps into non-matching elements', () => {
    const child = React.createElement(Other, null);
    const result = recursiveCloneChildren(child, { 'data-injected': true }, ['Target'], 'uid') as React.ReactElement<
      Record<string, unknown>
    >[];
    expect(result[0].props['data-injected']).toBeUndefined();
  });

  it('assigns a key based on uniqueId and index', () => {
    const child = React.createElement(Target, null);
    const result = recursiveCloneChildren(child, {}, ['Target'], 'myid') as React.ReactElement[];
    expect(result[0].key).toContain('myid-0');
  });

  it('recursively processes nested children', () => {
    const inner = React.createElement(Target, null);
    const outer = React.createElement(Other, null, inner);
    const result = recursiveCloneChildren(outer, { 'data-deep': true }, ['Target'], 'uid') as React.ReactElement[];
    const outerEl = result[0] as React.ReactElement<Record<string, unknown>>;
    // outer (Other) should not get the prop
    expect(outerEl.props['data-deep']).toBeUndefined();
    // The inner children are passed as the 3rd arg to cloneElement — check via props.children
    const innerResult = outerEl.props['children'] as React.ReactElement<Record<string, unknown>>[];
    expect(innerResult[0].props['data-deep']).toBe(true);
  });

  it('returns only the first mapped child when asChild is true', () => {
    const children = [React.createElement(Target, { key: 'a' }), React.createElement(Other, { key: 'b' })];
    const result = recursiveCloneChildren(children, {}, ['Target'], 'uid', true);
    // asChild → return mappedChildren?.[0], not the array
    expect(Array.isArray(result)).toBe(false);
  });

  it('returns full array when asChild is false', () => {
    const children = [React.createElement(Target, { key: 'a' }), React.createElement(Other, { key: 'b' })];
    const result = recursiveCloneChildren(children, {}, ['Target'], 'uid', false);
    expect(Array.isArray(result)).toBe(true);
    expect((result as React.ReactElement[]).length).toBe(2);
  });
});
