export type BulletListProps = React.HTMLAttributes<HTMLUListElement>;

const BulletList = (props: BulletListProps) => {
  return <ul className="marker:text-text-strong-950 mb-4 flex list-disc flex-col pl-6" {...props} />;
};

export default BulletList;
