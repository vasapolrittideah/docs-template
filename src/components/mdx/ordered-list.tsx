export type BulletListProps = React.HTMLAttributes<HTMLUListElement>;

const OrderedList = (props: BulletListProps) => {
  return <ol className="mb-4 flex list-decimal flex-col space-y-2 pl-6 leading-7 marker:font-medium" {...props} />;
};

export default OrderedList;
