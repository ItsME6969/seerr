import CachedImage from '@app/components/Common/CachedImage';
import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import useDiscover from '@app/hooks/useDiscover';
import globalMessages from '@app/i18n/globalMessages';
import ErrorPage from '@app/pages/_error';
import defineMessages from '@app/utils/defineMessages';
import {
  BuildingOffice2Icon,
  GlobeAltIcon,
  MapPinIcon,
  TvIcon,
} from '@heroicons/react/24/outline';
import type { TvResult } from '@server/models/Search';
import type { TvNetwork } from '@server/models/common';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Discover.DiscoverNetwork', {
  networkSeries: '{network} Series',
  network: 'Network',
  series: 'Series',
  website: 'Official website',
});

const DiscoverTvNetwork = () => {
  const router = useRouter();
  const intl = useIntl();

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
    firstResultData,
  } = useDiscover<TvResult, { network: TvNetwork }>(
    `/api/v1/discover/tv/network/${router.query.networkId}`
  );

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const network = firstResultData?.network;
  const title = isLoadingInitialData
    ? intl.formatMessage(globalMessages.loading)
    : intl.formatMessage(messages.networkSeries, {
        network: network?.name,
      });

  return (
    <>
      <PageTitle title={title} />
      <section className="relative mb-8 overflow-hidden rounded-2xl border border-gray-700/80 bg-gray-900/70 shadow-2xl shadow-black/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(139,92,246,0.2),transparent_36%),linear-gradient(135deg,rgba(30,41,59,0.9),rgba(15,23,42,0.98))]" />
        <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(180px,260px)_1fr] md:items-center">
          <div className="flex h-40 items-center justify-center rounded-xl border border-white/10 bg-black/20 p-6 sm:h-48">
            {network?.logoPath ? (
              <CachedImage
                type="tmdb"
                src={`https://image.tmdb.org/t/p/w780${network.logoPath}`}
                alt={network.name}
                className="max-h-full max-w-full object-contain"
                width={780}
                height={300}
              />
            ) : (
              <BuildingOffice2Icon className="h-20 w-20 text-gray-500" />
            )}
          </div>
          <div className="min-w-0">
            {network ? (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
                  <span className="rounded-full bg-purple-500/15 px-3 py-1">
                    {intl.formatMessage(messages.network)}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                  {network.name}
                </h1>
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-gray-300">
                  {network.originCountry && (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-950/30 px-3 py-2">
                      <GlobeAltIcon className="h-4 w-4 text-purple-300" />
                      {network.originCountry}
                    </span>
                  )}
                  {network.headquarters && (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-950/30 px-3 py-2">
                      <MapPinIcon className="h-4 w-4 text-purple-300" />
                      {network.headquarters}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-950/30 px-3 py-2">
                    <TvIcon className="h-4 w-4 text-purple-300" />
                    {firstResultData?.totalResults ?? 0}{' '}
                    {intl.formatMessage(messages.series)}
                  </span>
                  {network.homepage && (
                    <a
                      href={network.homepage}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-purple-400/40 bg-purple-500/10 px-3 py-2 text-purple-200 transition hover:bg-purple-500/20"
                    >
                      {intl.formatMessage(messages.website)} ↗
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="animate-pulse">
                <div className="mb-4 h-6 w-24 rounded-full bg-purple-500/20" />
                <div className="h-12 max-w-md rounded-lg bg-gray-700/70" />
                <div className="mt-5 flex flex-wrap gap-2">
                  <div className="h-10 w-20 rounded-lg bg-gray-800/80" />
                  <div className="h-10 w-48 rounded-lg bg-gray-800/80" />
                  <div className="h-10 w-32 rounded-lg bg-gray-800/80" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="mb-5 mt-1">
        <Header>{intl.formatMessage(messages.series)}</Header>
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

export default DiscoverTvNetwork;
