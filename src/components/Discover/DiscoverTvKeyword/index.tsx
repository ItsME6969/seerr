import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import KeywordMediaTabs from '@app/components/Discover/KeywordMediaTabs';
import useDiscover, { encodeURIExtraParams } from '@app/hooks/useDiscover';
import { useUpdateQueryParams } from '@app/hooks/useUpdateQueryParams';
import globalMessages from '@app/i18n/globalMessages';
import ErrorPage from '@app/pages/_error';
import defineMessages from '@app/utils/defineMessages';
import { BarsArrowDownIcon } from '@heroicons/react/24/solid';
import type { TvSortOptions } from '@server/api/themoviedb';
import type { TmdbKeyword } from '@server/api/themoviedb/interfaces';
import type { TvResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Discover.DiscoverTvKeyword', {
  keywordSeries: '"{keywordTitle}" Series',
  sortPopularityDesc: 'Popularity Descending',
  sortPopularityAsc: 'Popularity Ascending',
  sortFirstAirDateDesc: 'First Air Date Descending',
  sortFirstAirDateAsc: 'First Air Date Ascending',
  sortTmdbRatingDesc: 'TMDB Rating Descending',
  sortTmdbRatingAsc: 'TMDB Rating Ascending',
  sortTitleAsc: 'Title (A-Z) Ascending',
  sortTitleDesc: 'Title (Z-A) Descending',
});

const SortOptions: Record<string, TvSortOptions> = {
  PopularityDesc: 'popularity.desc',
  PopularityAsc: 'popularity.asc',
  FirstAirDateDesc: 'first_air_date.desc',
  FirstAirDateAsc: 'first_air_date.asc',
  TmdbRatingDesc: 'vote_average.desc',
  TmdbRatingAsc: 'vote_average.asc',
  TitleAsc: 'original_name.asc',
  TitleDesc: 'original_name.desc',
};

const DiscoverTvKeyword = () => {
  const router = useRouter();
  const intl = useIntl();
  const updateQueryParams = useUpdateQueryParams({});

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
    firstResultData,
  } = useDiscover<TvResult, { keywords: TmdbKeyword[] }>(
    `/api/v1/discover/tv`,
    {
      keywords: encodeURIExtraParams(router.query.keywords as string),
      sortBy: router.query.sortBy as TvSortOptions,
    }
  );

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const title = isLoadingInitialData
    ? intl.formatMessage(globalMessages.loading)
    : intl.formatMessage(messages.keywordSeries, {
        keywordTitle: firstResultData?.keywords
          .map((k) => `${k.name[0].toUpperCase()}${k.name.substring(1)}`)
          .join(', '),
      });

  return (
    <>
      <PageTitle title={title} />
      <div className="mb-5 mt-1 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Header>{title}</Header>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-gray-100 sm:text-sm">
              <BarsArrowDownIcon className="h-5 w-5" />
            </span>
            <select
              id="keyword-sort-by"
              className="rounded-r-only"
              value={
                (router.query.sortBy as TvSortOptions) ||
                SortOptions.PopularityDesc
              }
              onChange={(e) => updateQueryParams('sortBy', e.target.value)}
            >
              <option value={SortOptions.PopularityDesc}>
                {intl.formatMessage(messages.sortPopularityDesc)}
              </option>
              <option value={SortOptions.PopularityAsc}>
                {intl.formatMessage(messages.sortPopularityAsc)}
              </option>
              <option value={SortOptions.FirstAirDateDesc}>
                {intl.formatMessage(messages.sortFirstAirDateDesc)}
              </option>
              <option value={SortOptions.FirstAirDateAsc}>
                {intl.formatMessage(messages.sortFirstAirDateAsc)}
              </option>
              <option value={SortOptions.TmdbRatingDesc}>
                {intl.formatMessage(messages.sortTmdbRatingDesc)}
              </option>
              <option value={SortOptions.TmdbRatingAsc}>
                {intl.formatMessage(messages.sortTmdbRatingAsc)}
              </option>
              <option value={SortOptions.TitleAsc}>
                {intl.formatMessage(messages.sortTitleAsc)}
              </option>
              <option value={SortOptions.TitleDesc}>
                {intl.formatMessage(messages.sortTitleDesc)}
              </option>
            </select>
          </div>
          <KeywordMediaTabs
            active="tv"
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

export default DiscoverTvKeyword;
