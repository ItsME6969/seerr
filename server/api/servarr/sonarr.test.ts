import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import type { AxiosInstance } from 'axios';

import SonarrAPI from '@server/api/servarr/sonarr';

function buildSonarr(): SonarrAPI {
  return new SonarrAPI({ url: 'http://localhost:8989/api/v3', apiKey: 'test' });
}

function getAxios(sonarr: SonarrAPI): AxiosInstance {
  return (sonarr as unknown as { axios: AxiosInstance }).axios;
}

describe('SonarrAPI removeSeries', () => {
  afterEach(() => mock.restoreAll());

  it('removes the series when it exists in the library', async () => {
    const sonarr = buildSonarr();
    mock.method(SonarrAPI.prototype, 'getSeriesByTvdbId', async () => ({
      id: 9,
      title: 'Test Series',
    }));
    const del = mock.method(getAxios(sonarr), 'delete', async () => ({}));

    await sonarr.removeSeries(1234);

    assert.strictEqual(del.mock.callCount(), 1);
    assert.strictEqual(del.mock.calls[0].arguments[0], '/series/9');
  });

  it('does nothing when the series is not in the library', async () => {
    const sonarr = buildSonarr();
    mock.method(getAxios(sonarr), 'get', async () => ({
      data: [{ id: 0, title: 'Breaking Bad' }],
    }));
    const del = mock.method(getAxios(sonarr), 'delete', async () => ({}));

    await assert.doesNotReject(() => sonarr.removeSeries(1234));
    assert.strictEqual(del.mock.callCount(), 0);
  });

  it('rejects when the tvdbId is unknown to the lookup', async () => {
    const sonarr = buildSonarr();
    mock.method(getAxios(sonarr), 'get', async () => ({ data: [] }));
    const del = mock.method(getAxios(sonarr), 'delete', async () => ({}));

    await assert.rejects(() => sonarr.removeSeries(1234), /Series not found/);
    assert.strictEqual(del.mock.callCount(), 0);
  });

  it('ignores a 404 when the series was already removed in Sonarr', async () => {
    const sonarr = buildSonarr();
    mock.method(SonarrAPI.prototype, 'getSeriesByTvdbId', async () => ({
      id: 9,
      title: 'Test Series',
    }));
    mock.method(getAxios(sonarr), 'delete', async () => {
      throw { response: { status: 404 } };
    });

    await assert.doesNotReject(() => sonarr.removeSeries(1234));
  });

  it('rethrows errors other than 404', async () => {
    const sonarr = buildSonarr();
    mock.method(SonarrAPI.prototype, 'getSeriesByTvdbId', async () => ({
      id: 9,
      title: 'Test Series',
    }));
    mock.method(getAxios(sonarr), 'delete', async () => {
      throw { response: { status: 500 } };
    });

    await assert.rejects(() => sonarr.removeSeries(1234));
  });

  it('rethrows a 404 from the lookup instead of treating it as removed', async () => {
    const sonarr = buildSonarr();
    mock.method(getAxios(sonarr), 'get', async () => {
      throw { response: { status: 404 } };
    });
    const del = mock.method(getAxios(sonarr), 'delete', async () => ({}));

    await assert.rejects(
      () => sonarr.removeSeries(1234),
      (e: unknown) =>
        (e as { response?: { status?: number } }).response?.status === 404
    );
    assert.strictEqual(del.mock.callCount(), 0);
  });
});

describe('SonarrAPI getSeriesByTvdbId', () => {
  afterEach(() => mock.restoreAll());

  it('rethrows a 401 from the lookup with the status intact', async () => {
    const sonarr = buildSonarr();
    mock.method(getAxios(sonarr), 'get', async () => {
      throw { response: { status: 401 } };
    });

    await assert.rejects(
      () => sonarr.getSeriesByTvdbId(1234),
      (e: unknown) =>
        (e as { response?: { status?: number } }).response?.status === 401
    );
  });

  it('throws "Series not found" when the lookup returns no results', async () => {
    const sonarr = buildSonarr();
    mock.method(getAxios(sonarr), 'get', async () => ({ data: [] }));

    await assert.rejects(() => sonarr.getSeriesByTvdbId(1234), {
      message: 'Series not found',
    });
  });
});

describe('SonarrAPI season search on add', () => {
  afterEach(() => mock.restoreAll());

  const options = {
    tvdbid: 1234,
    title: 'Test Series',
    profileId: 1,
    seasons: [2],
    seasonFolder: true,
    rootFolderPath: '/tv',
    seriesType: 'standard' as const,
    searchNow: true,
  };

  it('asks Sonarr to search after refreshing a newly added series', async () => {
    const sonarr = buildSonarr();
    mock.method(SonarrAPI.prototype, 'getSeriesByTvdbId', async () => ({
      seasons: [{ seasonNumber: 1 }, { seasonNumber: 2 }],
    }));
    const post = mock.method(getAxios(sonarr), 'post', async () => ({
      data: { id: 9 },
    }));

    await sonarr.addSeries(options);

    const body = post.mock.calls[0].arguments[1] as {
      addOptions: { searchForMissingEpisodes: boolean };
      seasons: { seasonNumber: number; monitored: boolean }[];
    };
    assert.equal(body.addOptions.searchForMissingEpisodes, true);
    assert.deepEqual(
      body.seasons.map((s) => s.monitored),
      [false, true]
    );
    assert.equal(post.mock.callCount(), 1);
  });

  it('searches a requested existing season even when its statistics are zero', async () => {
    const sonarr = buildSonarr();
    const series = {
      id: 9,
      title: 'Test Series',
      tags: [],
      seriesType: 'standard' as const,
      seasons: [
        {
          seasonNumber: 2,
          monitored: false,
          statistics: { episodeCount: 0, episodeFileCount: 0 },
        },
      ],
    };
    mock.method(SonarrAPI.prototype, 'getSeriesByTvdbId', async () => series);
    mock.method(SonarrAPI.prototype, 'getEpisodes', async () => []);
    mock.method(getAxios(sonarr), 'put', async () => ({ data: series }));
    const post = mock.method(getAxios(sonarr), 'post', async () => ({}));

    await sonarr.addSeries(options);

    assert.deepEqual(post.mock.calls[0].arguments.slice(0, 2), [
      '/command',
      { name: 'SeasonSearch', seriesId: 9, seasonNumber: 2 },
    ]);
  });
});
