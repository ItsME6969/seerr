import CachedImage from '@app/components/Common/CachedImage';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useState } from 'react';

interface PersonCardProps {
  personId: number;
  name: string;
  subName?: string;
  profilePath?: string;
  canExpand?: boolean;
  compact?: boolean;
}

const PersonCard = ({
  personId,
  name,
  subName,
  profilePath,
  canExpand = false,
  compact = false,
}: PersonCardProps) => {
  const [isHovered, setHovered] = useState(false);

  return (
    <Link
      href={`/person/${personId}`}
      className={canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setHovered(true);
        }
      }}
      role="link"
      tabIndex={0}
    >
      <div
        className={`relative ${
          canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'
        } transform-gpu cursor-pointer rounded-xl text-white shadow ring-1 transition duration-150 ease-in-out ${
          isHovered
            ? 'scale-105 bg-gray-700 ring-gray-500'
            : 'scale-100 bg-gray-800 ring-gray-700'
        }`}
      >
        <div
          className={compact ? 'h-48' : undefined}
          style={compact ? undefined : { paddingBottom: '150%' }}
        >
          <div className="absolute inset-0 flex h-full w-full flex-col items-center p-2">
            <div
              className={`relative mb-4 mt-2 flex justify-center ${
                compact ? 'aspect-square w-3/4 flex-none' : 'h-1/2 w-full'
              }`}
            >
              {profilePath ? (
                <div
                  className={`relative h-full overflow-hidden rounded-full ring-1 ring-gray-700 ${
                    compact ? 'w-full' : 'w-3/4'
                  }`}
                >
                  <CachedImage
                    type="tmdb"
                    src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${profilePath}`}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 25%',
                    }}
                    fill
                  />
                </div>
              ) : (
                <div className="aspect-square h-full">
                  <UserCircleIcon className="h-full w-full" />
                </div>
              )}
            </div>
            <div className="w-full truncate text-center font-bold">{name}</div>
            {subName && (
              <div
                className="overflow-hidden whitespace-normal text-center text-sm text-gray-300"
                style={{
                  WebkitLineClamp: 2,
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {subName}
              </div>
            )}
            <div
              className={`absolute bottom-0 left-0 right-0 h-12 rounded-b-xl bg-gradient-to-t ${
                isHovered ? 'from-gray-800' : 'from-gray-900'
              }`}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PersonCard;
