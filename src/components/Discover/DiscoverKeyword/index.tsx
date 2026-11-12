import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import KeywordMediaTabs from '@app/components/Discover/KeywordMediaTabs';
import useDiscover, { encodeURIExtraParams } from '@app/hooks/useDiscover';
import { useUpdateQueryParams } from '@app/hooks/useUpdateQueryParams';
import ErrorPage from '@app/pages/_error';
import defineMessages from '@app/utils/defineMessages';
import { BarsArrowDownIcon } from '@heroicons/react/24/solid';
import type { TmdbKeyword } from '@server/api/themoviedb/interfaces';
import type { MovieResult, TvResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { useIntl, type MessageDescriptor } from 'react-intl';

const messages = defineMessages('components.Discover.DiscoverKeyword', {
  keywordMovies: 'Keyword: "{keywordTitle}" - Movies',
  keywordSeries: 'Keyword: "{keywordTitle}" - Series',
  sortPopularityDesc: 'Popularity Descending',
  sortPopularityAsc: 'Popularity Ascending',
  sortReleaseDateDesc: 'Release Date Descending',
  sortReleaseDateAsc: 'Release Date Ascending',
  sortFirstAirDateDesc: 'First Air Date Descending',
  sortFirstAirDateAsc: 'First Air Date Ascending',
  sortTmdbRatingDesc: 'TMDB Rating Descending',
  sortTmdbRatingAsc: 'TMDB Rating Ascending',
  sortTitleAsc: 'Title (A-Z) Ascending',
  sortTitleDesc: 'Title (Z-A) Descending',
});

const DiscoverKeyword = ({ mediaType }: { mediaType: 'movie' | 'tv' }) => {
  const router = useRouter();
  const intl = useIntl();
  const updateQueryParams = useUpdateQueryParams({});
  const isTv = mediaType === 'tv';
  const sortOptions: [string, MessageDescriptor][] = isTv
    ? [
        ['popularity.desc', messages.sortPopularityDesc],
        ['popularity.asc', messages.sortPopularityAsc],
        ['first_air_date.desc', messages.sortFirstAirDateDesc],
        ['first_air_date.asc', messages.sortFirstAirDateAsc],
        ['vote_average.desc', messages.sortTmdbRatingDesc],
        ['vote_average.asc', messages.sortTmdbRatingAsc],
        ['original_name.asc', messages.sortTitleAsc],
        ['original_name.desc', messages.sortTitleDesc],
      ]
    : [
        ['popularity.desc', messages.sortPopularityDesc],
        ['popularity.asc', messages.sortPopularityAsc],
        ['primary_release_date.desc', messages.sortReleaseDateDesc],
        ['primary_release_date.asc', messages.sortReleaseDateAsc],
        ['vote_average.desc', messages.sortTmdbRatingDesc],
        ['vote_average.asc', messages.sortTmdbRatingAsc],
        ['original_title.asc', messages.sortTitleAsc],
        ['original_title.desc', messages.sortTitleDesc],
      ];

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
    firstResultData,
  } = useDiscover<MovieResult | TvResult, { keywords: TmdbKeyword[] }>(
    '/api/v1/discover/keyword',
    {
      mediaType,
      keywords: encodeURIExtraParams(router.query.keywords as string),
      ...(router.query.sortBy ? { sortBy: router.query.sortBy } : {}),
    }
  );

  if (error) return <ErrorPage statusCode={500} />;

  const keywordTitle = firstResultData?.keywords
    ?.map(
      (keyword) =>
        `${keyword.name[0].toUpperCase()}${keyword.name.substring(1)}`
    )
    .join(', ');
  const title = intl.formatMessage(
    isTv ? messages.keywordSeries : messages.keywordMovies,
    { keywordTitle: keywordTitle ?? '' }
  );

  return (
    <>
      <PageTitle title={title} />
      <div className="mb-5 mt-1 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Header>
            {isLoadingInitialData ? (
              <div className="h-9 w-72 animate-pulse rounded-lg bg-gray-700/70" />
            ) : (
              title
            )}
          </Header>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-gray-100 sm:text-sm">
              <BarsArrowDownIcon className="h-5 w-5" />
            </span>
            <select
              className="rounded-r-only"
              value={router.query.sortBy || 'popularity.desc'}
              onChange={(event) =>
                updateQueryParams('sortBy', event.target.value)
              }
            >
              {sortOptions.map(([value, message]) => (
                <option key={value} value={value}>
                  {intl.formatMessage(message)}
                </option>
              ))}
            </select>
          </div>
          <KeywordMediaTabs
            active={mediaType}
            keywordIds={router.query.keywords as string}
            sortBy={router.query.sortBy as string}
          />
        </div>
      </div>
      <ListView
        items={titles}
        isEmpty={isEmpty}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        isReachingEnd={isReachingEnd}
        onScrollBottom={fetchMore}
      />
    </>
  );
};

export default DiscoverKeyword;
