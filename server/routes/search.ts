import TheMovieDb from '@server/api/themoviedb';
import type { TmdbSearchMultiResponse } from '@server/api/themoviedb/interfaces';
import Media from '@server/entity/Media';
import { findSearchProvider } from '@server/lib/search';
import logger from '@server/logger';
import { mapSearchResults } from '@server/models/Search';
import { Router } from 'express';

const searchRoutes = Router();

const searchTypes = [
  'all',
  'movie',
  'tv',
  'person',
  'keyword',
  'company',
  'collection',
] as const;
type SearchType = (typeof searchTypes)[number];

const getSearchType = (value: unknown): SearchType =>
  searchTypes.includes(value as SearchType) ? (value as SearchType) : 'all';

searchRoutes.get('/', async (req, res, next) => {
  const normalizedQuery =
    typeof req.query.query === 'string'
      ? req.query.query.trim().replace(/\s+/g, ' ')
      : '';
  const searchType = getSearchType(req.query.type);
  const queryString =
    normalizedQuery ||
    (searchType === 'keyword' ? 'based' : searchType === 'company' ? 'a' : '');

  if (!queryString && searchType === 'person') {
    try {
      const tmdb = new TheMovieDb();
      const people = await tmdb.getPopularPeople({
        page: Number(req.query.page) || 1,
        language: (req.query.language as string) ?? req.locale,
      });
      const popularPeople = Array.isArray(people.results) ? people.results : [];

      return res.status(200).json({
        page: people.page || 1,
        totalPages: people.total_pages || 0,
        totalResults: people.total_results || 0,
        results: mapSearchResults(
          popularPeople.map((person) => ({
            ...person,
            media_type: 'person' as const,
          }))
        ),
      });
    } catch (e) {
      logger.debug('Something went wrong retrieving popular people', {
        label: 'API',
        errorMessage: e.message,
      });
      return next({
        status: 500,
        message: 'Unable to retrieve popular people.',
      });
    }
  }

  if (!queryString?.trim()) {
    return res.status(200).json({
      page: 1,
      totalPages: 0,
      totalResults: 0,
      results: [],
    });
  }

  const searchProvider = findSearchProvider(queryString.toLowerCase());
  let results: TmdbSearchMultiResponse;

  try {
    if (searchType === 'keyword') {
      const tmdb = new TheMovieDb();
      const keywordResults = await tmdb.searchKeyword({
        query: queryString,
        page: Number(req.query.page) || 1,
      });
      return res.status(200).json({
        page: keywordResults.page,
        totalPages: keywordResults.total_pages,
        totalResults: keywordResults.total_results,
        results: keywordResults.results.map((result) => ({
          id: result.id,
          name: result.name,
          mediaType: 'keyword',
        })),
      });
    }

    if (searchType === 'company') {
      const tmdb = new TheMovieDb();
      const companyResults = await tmdb.searchCompany({
        query: queryString,
        page: Number(req.query.page) || 1,
      });
      return res.status(200).json({
        page: companyResults.page,
        totalPages: companyResults.total_pages,
        totalResults: companyResults.total_results,
        results: companyResults.results.map((result) => ({
          id: result.id,
          name: result.name,
          logoPath: result.logo_path,
          originCountry: result.origin_country,
          mediaType: 'company',
        })),
      });
    }

    if (searchType === 'collection') {
      const tmdb = new TheMovieDb();
      const collectionResults = await tmdb.searchCollections({
        query: queryString,
        page: Number(req.query.page),
        language: (req.query.language as string) ?? req.locale,
      });

      return res.status(200).json({
        page: collectionResults.page,
        totalPages: collectionResults.total_pages,
        totalResults: collectionResults.total_results,
        results: mapSearchResults(
          collectionResults.results.map((result) => ({
            ...result,
            media_type: 'collection' as const,
          }))
        ),
      });
    }

    if (searchProvider && searchType === 'all') {
      const [id] = queryString
        .toLowerCase()
        .match(searchProvider.pattern) as RegExpMatchArray;
      results = await searchProvider.search({
        id,
        language: (req.query.language as string) ?? req.locale,
        query: queryString,
      });
    } else {
      const tmdb = new TheMovieDb();
      if (searchType === 'movie') {
        const response = await tmdb.searchMovies({
          query: queryString,
          page: Number(req.query.page),
          language: (req.query.language as string) ?? req.locale,
        });
        results = {
          ...response,
          results: response.results.map((result) => ({
            ...result,
            media_type: 'movie' as const,
          })),
        };
      } else if (searchType === 'tv') {
        const response = await tmdb.searchTvShows({
          query: queryString,
          page: Number(req.query.page),
          language: (req.query.language as string) ?? req.locale,
        });
        results = {
          ...response,
          results: response.results.map((result) => ({
            ...result,
            media_type: 'tv' as const,
          })),
        };
      } else if (searchType === 'person') {
        const response = await tmdb.searchPeople({
          query: queryString,
          page: Number(req.query.page),
          language: (req.query.language as string) ?? req.locale,
        });
        results = {
          ...response,
          results: response.results.map((result) => ({
            ...result,
            media_type: 'person' as const,
          })),
        };
      } else {
        results = await tmdb.searchMulti({
          query: queryString,
          page: Number(req.query.page),
          language: (req.query.language as string) ?? req.locale,
        });
      }
    }

    const media = await Media.getRelatedMedia(
      req.user,
      results.results.map((result) => ({
        tmdbId: result.id,
        mediaType: result.media_type,
      }))
    );

    return res.status(200).json({
      page: results.page,
      totalPages: results.total_pages,
      totalResults: results.total_results,
      results: mapSearchResults(results.results, media),
    });
  } catch (e) {
    logger.debug('Something went wrong retrieving search results', {
      label: 'API',
      errorMessage: e.message,
      query: req.query.query,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve search results.',
    });
  }
});

searchRoutes.get('/keyword', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const results = await tmdb.searchKeyword({
      query: req.query.query as string,
      page: Number(req.query.page),
    });

    return res.status(200).json(results);
  } catch (e) {
    logger.debug('Something went wrong retrieving keyword search results', {
      label: 'API',
      errorMessage: e.message,
      query: req.query.query,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve keyword search results.',
    });
  }
});

searchRoutes.get('/company', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const results = await tmdb.searchCompany({
      query: req.query.query as string,
      page: Number(req.query.page),
    });

    return res.status(200).json(results);
  } catch (e) {
    logger.debug('Something went wrong retrieving company search results', {
      label: 'API',
      errorMessage: e.message,
      query: req.query.query,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve company search results.',
    });
  }
});

export default searchRoutes;
