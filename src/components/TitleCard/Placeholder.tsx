interface PlaceholderProps {
  canExpand?: boolean;
  compact?: boolean;
}

const Placeholder = ({
  canExpand = false,
  compact = false,
}: PlaceholderProps) => {
  return (
    <div
      className={`relative animate-pulse rounded-xl bg-gray-700 ${
        canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'
      } ${compact ? 'h-48' : ''}`}
    >
      {!compact && <div className="w-full" style={{ paddingBottom: '150%' }} />}
    </div>
  );
};

export default Placeholder;
