import { formatThaiDate } from '@/lib/date';

interface LastModifiedProps {
  lastModified: string;
  lastAuthor: string;
}

const LastModified = ({ lastModified, lastAuthor }: LastModifiedProps) => {
  return (
    <p className="w-60 text-end text-sm italic sm:w-auto">
      <span className="text-text-sub-600">แก้ไขเมื่อ</span> <span>{formatThaiDate(lastModified)}</span>{' '}
      <span className="text-text-sub-600">โดย</span> <span>{lastAuthor}</span>
    </p>
  );
};

export default LastModified;
