/* eslint-disable react-hooks/exhaustive-deps */
import type { Nullable } from '@app/utils/typeHelpers';
import { useRouter } from 'next/router';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import type { UrlObject } from 'url';
import useDebouncedState from './useDebouncedState';

type Url = string | UrlObject;
export type SearchType =
  | 'all'
  | 'movie'
  | 'tv'
  | 'person'
  | 'keyword'
  | 'company'
  | 'collection';

const normalizeSearchQuery = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

const getSearchTypeFromPathname = (
  pathname: string
): SearchType | undefined => {
  if (pathname.startsWith('/collection/')) return 'collection';
  if (pathname.includes('/keyword')) return 'keyword';
  if (pathname.includes('/studio/')) return 'company';
  if (pathname.startsWith('/person/')) return 'person';
  if (pathname.startsWith('/discover/movies')) return 'movie';
  if (pathname.startsWith('/discover/tv')) return 'tv';

  return undefined;
};

interface SearchObject {
  searchValue: string;
  searchOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setSearchValue: Dispatch<SetStateAction<string>>;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  clear: () => void;
}

const useSearchInput = (): SearchObject => {
  const router = useRouter();
  const [searchOpen, setIsOpen] = useState(false);
  const [searchType, setSearchTypeState] = useState<SearchType>(
    (router.query.type as SearchType) ||
      getSearchTypeFromPathname(router.pathname) ||
      'all'
  );
  const [lastRoute, setLastRoute] = useState<Nullable<Url>>(null);
  const [searchValue, debouncedValue, setSearchValue] = useDebouncedState(
    (router.query.query as string) ?? ''
  );

  /**
   * This effect handles routing when the debounced search input
   * value changes.
   *
   * If we are not already on the /search route, then we push
   * in a new route. If we are, then we only replace the history.
   */
  useEffect(() => {
    const normalizedValue = normalizeSearchQuery(debouncedValue);

    if (normalizedValue !== '' && searchOpen) {
      if (router.pathname.startsWith('/search')) {
        router.replace({
          pathname: router.pathname,
          query: {
            ...router.query,
            query: normalizedValue,
          },
        });
      } else {
        setLastRoute(router.asPath);
        router
          .push({
            pathname: '/search',
            query: {
              query: normalizedValue,
              ...(searchType !== 'all' ? { type: searchType } : {}),
            },
          })
          .then(() => window.scrollTo(0, 0));
      }
    }
  }, [debouncedValue]);

  /**
   * This effect is handling behavior when the search input is closed.
   *
   * If we have a lastRoute, we will route back to it. If we don't
   * (in the case of a deeplink) we take the user back to the index route
   */
  useEffect(() => {
    if (
      searchValue === '' &&
      router.pathname.startsWith('/search') &&
      !searchOpen &&
      !lastRoute &&
      !router.query.type
    ) {
      if (lastRoute) {
        router.push(lastRoute).then(() => window.scrollTo(0, 0));
      } else {
        router.replace('/').then(() => window.scrollTo(0, 0));
      }
    }
  }, [searchOpen]);

  /**
   * This effect handles behavior for when the route is changed.
   *
   * If after a route change, the new debounced value is not the same
   * as the query value then we will update the searchValue to either the
   * new query or to an empty string (in the case of null). This makes sure
   * that the value in the searchbox is whatever the user last entered regardless
   * of routing to something like a detail page.
   *
   * If the new route is not /search and query is null, then we will close the
   * search if it is open.
   *
   * In the final case, we want the search to always be open in the case the user
   * is on /search
   */
  useEffect(() => {
    const routeSearchType =
      (router.query.type as SearchType) ||
      getSearchTypeFromPathname(router.pathname);

    if (routeSearchType || !router.pathname.startsWith('/search')) {
      const nextSearchType = routeSearchType ?? 'all';
      if (nextSearchType !== searchType) {
        setSearchTypeState(nextSearchType);
      }
    }

    if (router.query.query !== debouncedValue) {
      setSearchValue(
        router.query.query
          ? normalizeSearchQuery(
              decodeURIComponent(router.query.query as string)
            )
          : ''
      );

      if (!router.pathname.startsWith('/search') && !router.query.query) {
        setIsOpen(false);
      }
    }

    if (router.pathname.startsWith('/search')) {
      setIsOpen(true);
    }
  }, [router, setSearchValue, searchType]);

  const clear = () => {
    setSearchValue('');

    if (searchType === 'movie') {
      router.replace('/discover/movies');
    } else if (searchType === 'tv') {
      router.replace('/discover/tv');
    } else if (searchType === 'all') {
      router.replace('/');
    } else {
      router.replace({
        pathname: '/search',
        query: { type: searchType },
      });
    }
  };

  const setSearchType = (type: SearchType) => {
    setSearchTypeState(type);

    if (normalizeSearchQuery(searchValue) === '') {
      if (type === 'movie') {
        router.push('/discover/movies');
      } else if (type === 'tv') {
        router.push('/discover/tv');
      } else if (type === 'all') {
        router.push('/');
      } else {
        router.push({
          pathname: '/search',
          query: { type },
        });
      }

      return;
    }

    if (!router.pathname.startsWith('/search')) {
      return;
    }

    router.replace({
      pathname: router.pathname,
      query:
        type === 'all'
          ? (() => {
              const query = { ...router.query };
              delete query.type;
              return query;
            })()
          : { ...router.query, type },
    });
  };

  return {
    searchValue,
    searchOpen,
    setIsOpen,
    setSearchValue,
    searchType,
    setSearchType,
    clear,
  };
};

export default useSearchInput;
