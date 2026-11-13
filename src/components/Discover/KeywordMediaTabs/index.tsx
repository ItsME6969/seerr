import { FilmIcon, TvIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type KeywordMediaTabsProps = {
  active: 'movie' | 'tv';
  keywordIds?: string;
  sortBy?: string;
};

const KeywordMediaTabs = ({
  active,
  keywordIds,
  sortBy,
}: KeywordMediaTabsProps) => {
  const [selected, setSelected] = useState(active);

  useEffect(() => {
    setSelected(active);
  }, [active]);

  const params = new URLSearchParams();
  if (keywordIds) params.set('keywords', keywordIds);
  if (sortBy) params.set('sortBy', sortBy);
  const query = params.toString() ? `?${params.toString()}` : '';

  return (
    <div className="flex shrink-0 overflow-hidden rounded-md border border-gray-500 text-sm">
      <Link
        href={`/discover/keyword${query ? `${query}&mediaType=movie` : '?mediaType=movie'}`}
        className={`px-4 py-2 transition ${
          selected === 'movie'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
        onMouseDown={() => setSelected('movie')}
      >
        <FilmIcon className="mr-1 inline-block h-4 w-4 align-text-bottom" />
        Movies
      </Link>
      <Link
        href={`/discover/keyword${query ? `${query}&mediaType=tv` : '?mediaType=tv'}`}
        className={`border-l border-gray-500 px-4 py-2 transition ${
          selected === 'tv'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
        onMouseDown={() => setSelected('tv')}
      >
        <TvIcon className="mr-1 inline-block h-4 w-4 align-text-bottom" />
        Series
      </Link>
    </div>
  );
};

export default KeywordMediaTabs;
