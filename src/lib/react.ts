/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

type AsProp<T extends React.ElementType> = {
  as?: T;
};

type PropsToOmit<T extends React.ElementType, P> = keyof (AsProp<T> & P);

type PolymorphicComponentProp<T extends React.ElementType, Props = object> = React.PropsWithChildren<
  Props & AsProp<T>
> &
  Omit<React.ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>;

export type PolymorphicRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>['ref'];

type PolymorphicComponentPropWithRef<T extends React.ElementType, Props = object> = PolymorphicComponentProp<
  T,
  Props
> & {
  ref?: PolymorphicRef<T>;
};

export type PolymorphicComponentPropsWithRef<T extends React.ElementType, P = object> = PolymorphicComponentPropWithRef<
  T,
  P
>;

export type PolymorphicComponentProps<T extends React.ElementType, P = object> = PolymorphicComponentProp<T, P>;

export type PolymorphicComponent<P> = {
  <T extends React.ElementType>(props: PolymorphicComponentPropsWithRef<T, P>): React.ReactNode;
};

export function recursiveCloneChildren(
  children: React.ReactNode,
  additionalProps: any,
  displayNames: string[],
  uniqueId: string,
  asChild?: boolean,
): React.ReactNode | React.ReactNode[] {
  const mappedChildren = React.Children.map(children, (child: React.ReactNode, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    const displayName = (child.type as React.ComponentType)?.displayName || '';
    const newProps = displayNames.includes(displayName) ? additionalProps : {};

    const childProps = (child as React.ReactElement<any>).props;

    return React.cloneElement(
      child,
      { ...newProps, key: `${uniqueId}-${index}` },
      recursiveCloneChildren(childProps?.children, additionalProps, displayNames, uniqueId, childProps?.asChild),
    );
  });

  return asChild ? mappedChildren?.[0] : mappedChildren;
}
