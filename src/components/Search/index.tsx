import CachedImage from '@app/components/Common/CachedImage';
import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import useDiscover from '@app/hooks/useDiscover';
import searchTypeMessages from '@app/i18n/searchTypeMessages';
import ErrorPage from '@app/pages/_error';
import defineMessages from '@app/utils/defineMessages';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import type {
  CollectionResult,
  MovieResult,
  PersonResult,
  TvResult,
} from '@server/models/Search';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

interface SearchLookupResult {
  id: number;
  name: string;
  mediaType: 'keyword' | 'company';
  logoPath?: string;
  originCountry?: string;
}

const messages = defineMessages('components.Search', {
  search: 'Search',
  searchresults: 'Search Results',
  searchresultsCategory: 'Search Results - {category}',
  keyword: 'Keyword',
});

const Search = () => {
  const intl = useIntl();
  const router = useRouter();
  const searchType =
    (router.query.type as
      | 'all'
      | 'movie'
      | 'tv'
      | 'person'
      | 'keyword'
      | 'company'
      | 'collection'
      | undefined) ?? 'all';
  const isPersonSearch = searchType === 'person';
  const query =
    typeof router.query.query === 'string' ? router.query.query.trim() : '';
  const searchQuery =
    query ||
    (searchType === 'collection'
      ? 'collection'
      : searchType === 'keyword'
        ? 'based'
        : searchType === 'company'
          ? 'a'
          : '');
  const shouldSearch = Boolean(searchQuery) || searchType === 'person';
  const categoryMessages = {
    all: searchTypeMessages.all,
    movie: searchTypeMessages.movies,
    tv: searchTypeMessages.series,
    person: searchTypeMessages.people,
    keyword: searchTypeMessages.keywords,
    company: searchTypeMessages.companies,
    collection: searchTypeMessages.collections,
  } as const;

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<
    | MovieResult
    | TvResult
    | PersonResult
    | CollectionResult
    | SearchLookupResult
  >(
    shouldSearch ? `/api/v1/search` : null,
    {
      query: searchQuery,
      ...(searchType !== 'all' ? { type: searchType } : {}),
    },
    { hideAvailable: false, hideBlocklisted: false, hideRequested: false }
  );

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const visibleTitles = isPersonSearch
    ? titles.filter((title) => title.mediaType === 'person')
    : titles;

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.search)} />
      <div className="mb-5 mt-1">
        <Header>
          {searchType === 'all'
            ? intl.formatMessage(messages.searchresults)
            : intl.formatMessage(messages.searchresultsCategory, {
                category: intl.formatMessage(categoryMessages[searchType]),
              })}
        </Header>
      </div>
      {searchType === 'keyword' || searchType === 'company' ? (
        <>
          {isEmpty && (
            <div className="mt-64 w-full text-center text-2xl text-gray-400">
              No results
            </div>
          )}
          {searchType === 'company' ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {(titles as SearchLookupResult[]).map((result) => (
                <li key={`${result.mediaType}-${result.id}`}>
                  <Link
                    href={`/discover/studio/${result.id}?mediaType=movie`}
                    className="group flex h-full min-h-48 flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-800/70 p-4 text-gray-100 shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:border-indigo-400/70 hover:bg-gray-800"
                  >
                    <div className="flex h-24 items-center justify-center rounded-lg bg-gray-950/40 p-3">
                      {result.logoPath ? (
                        <CachedImage
                          type="tmdb"
                          src={
                            result.logoPath.startsWith('http')
                              ? result.logoPath
                              : `https://image.tmdb.org/t/p/w185${result.logoPath}`
                          }
                          alt={result.name}
                          className="max-h-full max-w-full object-contain"
                          width={185}
                          height={100}
                        />
                      ) : (
                        <BuildingOffice2Icon className="h-12 w-12 text-gray-500" />
                      )}
                    </div>
                    <div className="mt-4 min-w-0">
                      <div className="truncate text-base font-semibold text-white group-hover:text-indigo-200">
                        {result.name}
                      </div>
                      {result.originCountry && (
                        <div className="mt-1 text-sm text-gray-400">
                          {result.originCountry}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-gray-700 overflow-hidden rounded-lg bg-gray-800/60">
              {(titles as SearchLookupResult[]).map((result) => (
                <li key={`${result.mediaType}-${result.id}`}>
                  <Link
                    href={`/discover/keyword?keywords=${result.id}&mediaType=movie`}
                    className="flex items-center gap-4 px-4 py-3 text-gray-100 transition hover:bg-gray-700"
                  >
                    <span className="w-16 text-xs uppercase text-gray-400">
                      {intl.formatMessage(messages.keyword)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-base text-gray-100">
                        {result.name}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {isLoadingMore && (
            <div className="py-6 text-center text-gray-400">Loading…</div>
          )}
        </>
      ) : (
        <ListView
          items={
            visibleTitles as (
              | MovieResult
              | TvResult
              | PersonResult
              | CollectionResult
            )[]
          }
          isEmpty={
            isPersonSearch
              ? !isLoadingInitialData && visibleTitles.length === 0
              : isEmpty
          }
          isLoading={
            isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
          }
          isReachingEnd={isReachingEnd}
          onScrollBottom={fetchMore}
          compactPeople={isPersonSearch}
        />
      )}
    </>
  );
};

export default Search;
