import useSearchInput, { type SearchType } from '@app/hooks/useSearchInput';
import searchTypeMessages from '@app/i18n/searchTypeMessages';
import defineMessages from '@app/utils/defineMessages';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Layout.SearchInput', {
  allPlaceholder: 'Search for a movie, TV show, person...',
  moviePlaceholder: 'Search for a movie...',
  tvPlaceholder: 'Search for a TV show...',
  personPlaceholder: 'Search for a person...',
  keywordPlaceholder: 'Search for a keyword...',
  companyPlaceholder: 'Search for a company...',
  collectionPlaceholder: 'Search for a collection...',
  searchType: 'Search type',
});

const searchTypes: {
  value: SearchType;
  message: keyof typeof searchTypeMessages;
}[] = [
  { value: 'all', message: 'all' },
  { value: 'movie', message: 'movies' },
  { value: 'tv', message: 'series' },
  { value: 'person', message: 'people' },
  { value: 'keyword', message: 'keywords' },
  { value: 'company', message: 'companies' },
  { value: 'collection', message: 'collections' },
];

const placeholderMessages: Record<SearchType, keyof typeof messages> = {
  all: 'allPlaceholder',
  movie: 'moviePlaceholder',
  tv: 'tvPlaceholder',
  person: 'personPlaceholder',
  keyword: 'keywordPlaceholder',
  company: 'companyPlaceholder',
  collection: 'collectionPlaceholder',
};

const SearchInput = () => {
  const intl = useIntl();
  const {
    searchValue,
    setSearchValue,
    setIsOpen,
    searchType,
    searchTypeLocked,
    setSearchType,
    clear,
  } = useSearchInput();
  return (
    <div className="flex flex-1">
      <div className="flex w-full">
        <label htmlFor="search_field" className="sr-only">
          Search
        </label>
        <div className="relative flex w-full items-center overflow-hidden rounded-full border border-gray-600 bg-gray-900/80 text-white focus-within:border-gray-500 focus-within:bg-gray-900 focus-within:text-gray-200 hover:border-gray-500">
          <div className="relative flex min-w-0 flex-1 items-center">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <input
              id="search_field"
              style={{ paddingRight: searchValue.length > 0 ? '1.75rem' : '' }}
              className="block w-full border-0 bg-transparent py-2 pl-10 text-white placeholder-gray-300 focus:outline-none focus:ring-0 sm:text-base"
              placeholder={intl.formatMessage(
                messages[placeholderMessages[searchType]]
              )}
              type="search"
              autoComplete="off"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => {
                if (searchValue === '') {
                  setIsOpen(false);
                }
              }}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
            {searchValue.length > 0 && (
              <button
                className="absolute inset-y-0 right-2 m-auto h-7 w-7 border-none p-1 text-gray-400 outline-none transition hover:text-white focus:border-none focus:outline-none"
                onClick={() => clear()}
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="h-6 border-l border-gray-700" />
          <label htmlFor="search_type" className="sr-only">
            {intl.formatMessage(messages.searchType)}
          </label>
          <select
            id="search_type"
            aria-label={intl.formatMessage(messages.searchType)}
            value={searchType}
            disabled={searchTypeLocked}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="mr-3 max-w-[7rem] cursor-pointer border-0 bg-transparent py-2 pl-3 pr-2 text-sm text-gray-200 focus:outline-none focus:ring-0 disabled:cursor-default disabled:opacity-100"
            style={{ color: 'rgb(211 178 252)' }}
          >
            {searchTypes.map(({ value, message }) => (
              <option
                key={value}
                value={value}
                className="bg-gray-900"
                style={{ color: 'rgb(211 178 252)' }}
              >
                {intl.formatMessage(searchTypeMessages[message])}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
