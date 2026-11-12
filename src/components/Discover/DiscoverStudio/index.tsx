import CachedImage from '@app/components/Common/CachedImage';
import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import useDiscover from '@app/hooks/useDiscover';
import { useUpdateQueryParams } from '@app/hooks/useUpdateQueryParams';
import globalMessages from '@app/i18n/globalMessages';
import ErrorPage from '@app/pages/_error';
import defineMessages from '@app/utils/defineMessages';
import {
  BarsArrowDownIcon,
  BuildingOffice2Icon,
  FilmIcon,
  GlobeAltIcon,
  MapPinIcon,
  TvIcon,
} from '@heroicons/react/24/outline';
import type { MovieResult, TvResult } from '@server/models/Search';
import type { ProductionCompany } from '@server/models/common';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useIntl, type MessageDescriptor } from 'react-intl';
import useSWR from 'swr';

const messages = defineMessages('components.Discover.DiscoverStudio', {
  studioMovies: '{studio} Movies',
  studio: 'Studio',
  parentCompany: 'Parent company',
  movies: 'Movies',
  series: 'Series',
  website: 'Official website',
  sortPopularityDesc: 'Popularity Descending',
  sortReleaseDateDesc: 'Release Date Descending',
  sortRatingDesc: 'TMDB Rating Descending',
  sortTitleAsc: 'Title (A-Z)',
});

const DiscoverMovieStudio = ({
  mediaType = 'movie',
}: {
  mediaType?: 'movie' | 'tv';
}) => {
  const router = useRouter();
  const intl = useIntl();
  const updateQueryParams = useUpdateQueryParams({});
  const isTv = mediaType === 'tv';
  const mediaLabel = intl.formatMessage(
    isTv ? messages.series : messages.movies
  );
  const sortOptions: [string, MessageDescriptor][] = isTv
    ? [
        ['popularity.desc', messages.sortPopularityDesc],
        ['first_air_date.desc', messages.sortReleaseDateDesc],
        ['vote_average.desc', messages.sortRatingDesc],
        ['name.asc', messages.sortTitleAsc],
      ]
    : [
        ['popularity.desc', messages.sortPopularityDesc],
        ['primary_release_date.desc', messages.sortReleaseDateDesc],
        ['vote_average.desc', messages.sortRatingDesc],
        ['original_title.asc', messages.sortTitleAsc],
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
  } = useDiscover<MovieResult | TvResult>(
    `/api/v1/discover/studio/${router.query.studioId}`,
    {
      mediaType: isTv ? 'tv' : 'movie',
      ...(router.query.sortBy ? { sortBy: router.query.sortBy } : {}),
    }
  );
  const { data: studio, error: studioError } = useSWR<ProductionCompany>(
    `/api/v1/discover/studio/${router.query.studioId}/details`
  );

  if (error || studioError) {
    return <ErrorPage statusCode={500} />;
  }

  if (!studio && !studioError) {
    return (
      <>
        <PageTitle title={intl.formatMessage(globalMessages.loading)} />
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-gray-700/80 bg-gray-900/70 shadow-2xl shadow-black/20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(139,92,246,0.2),transparent_36%),linear-gradient(135deg,rgba(30,41,59,0.9),rgba(15,23,42,0.98))]" />
          <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(180px,260px)_1fr] md:items-center">
            <div className="flex h-40 items-center justify-center rounded-xl border border-white/10 bg-black/20 p-6 sm:h-48">
              <BuildingOffice2Icon className="h-20 w-20 text-gray-600" />
            </div>
            <div className="min-w-0 animate-pulse">
              <div className="mb-4 h-6 w-20 rounded-full bg-purple-500/20" />
              <div className="h-12 max-w-md rounded-lg bg-gray-700/70" />
              <div className="mt-5 flex flex-wrap gap-2">
                <div className="h-10 w-20 rounded-lg bg-gray-800/80" />
                <div className="h-10 w-44 rounded-lg bg-gray-800/80" />
                <div className="h-10 w-32 rounded-lg bg-gray-800/80" />
                <div className="h-10 w-36 rounded-lg bg-purple-500/15" />
              </div>
            </div>
          </div>
        </section>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-800/70" />
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`studio-placeholder-${index}`}
              className="aspect-[2/3] animate-pulse rounded-xl bg-gray-800/70"
            />
          ))}
        </div>
      </>
    );
  }

  const title = isLoadingInitialData
    ? intl.formatMessage(globalMessages.loading)
    : intl.formatMessage(messages.studioMovies, {
        studio: `${studio?.name} ${mediaLabel}`,
      });
  return (
    <>
      <PageTitle title={title} />
      {studio && (
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-gray-700/80 bg-gray-900/70 shadow-2xl shadow-black/20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(139,92,246,0.2),transparent_36%),linear-gradient(135deg,rgba(30,41,59,0.9),rgba(15,23,42,0.98))]" />
          <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(180px,260px)_1fr] md:items-center">
            <div className="flex h-40 items-center justify-center rounded-xl border border-white/10 bg-black/20 p-6 sm:h-48">
              {studio.logoPath ? (
                <CachedImage
                  type="tmdb"
                  src={`https://image.tmdb.org/t/p/w780${studio.logoPath}`}
                  alt={studio.name}
                  className="max-h-full max-w-full object-contain"
                  width={780}
                  height={300}
                />
              ) : (
                <BuildingOffice2Icon className="h-20 w-20 text-gray-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
                <span className="rounded-full bg-purple-500/15 px-3 py-1">
                  {intl.formatMessage(messages.studio)}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                {studio.name}
              </h1>
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-gray-300">
                {studio.originCountry && (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-950/30 px-3 py-2">
                    <GlobeAltIcon className="h-4 w-4 text-purple-300" />
                    {studio.originCountry}
                  </span>
                )}
                {studio.headquarters && (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-950/30 px-3 py-2">
                    <MapPinIcon className="h-4 w-4 text-purple-300" />
                    {studio.headquarters}
                  </span>
                )}
                {studio.parentCompany && (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-950/30 px-3 py-2">
                    <BuildingOffice2Icon className="h-4 w-4 text-purple-300" />
                    {intl.formatMessage(messages.parentCompany)}:{' '}
                    {studio.parentCompany.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-950/30 px-3 py-2">
                  <FilmIcon className="h-4 w-4 text-purple-300" />
                  {firstResultData?.totalResults ?? 0} {mediaLabel}
                </span>
                {studio.homepage && (
                  <Link
                    href={studio.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-purple-400/40 bg-purple-500/10 px-3 py-2 text-purple-200 transition hover:bg-purple-500/20"
                  >
                    {intl.formatMessage(messages.website)} ↗
                  </Link>
                )}
              </div>
              {studio.description && (
                <p className="mt-5 max-w-4xl text-base leading-7 text-gray-300">
                  {studio.description}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
      <div className="mb-5 mt-1 flex items-end justify-between gap-4">
        <Header>{mediaLabel}</Header>
        <div className="flex items-center gap-2">
          <div className="flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-gray-100">
              <BarsArrowDownIcon className="h-5 w-5" />
            </span>
            <select
              className="rounded-r-only"
              value={(router.query.sortBy as string) || 'popularity.desc'}
              onChange={(e) => updateQueryParams('sortBy', e.target.value)}
            >
              {sortOptions.map(([value, message]) => (
                <option key={value} value={value}>
                  {intl.formatMessage(message)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex overflow-hidden rounded-md border border-gray-500 text-sm">
            <Link
              href={`/discover/studio/${router.query.studioId}?mediaType=movie${router.query.sortBy ? `&sortBy=${router.query.sortBy}` : ''}`}
              className={`px-4 py-2 ${!isTv ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <FilmIcon className="mr-1 inline-block h-4 w-4 align-text-bottom" />
              Movies
            </Link>
            <Link
              href={`/discover/studio/${router.query.studioId}?mediaType=tv${router.query.sortBy ? `&sortBy=${router.query.sortBy}` : ''}`}
              className={`border-l border-gray-500 px-4 py-2 ${isTv ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <TvIcon className="mr-1 inline-block h-4 w-4 align-text-bottom" />
              Series
            </Link>
          </div>
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

export default DiscoverMovieStudio;
