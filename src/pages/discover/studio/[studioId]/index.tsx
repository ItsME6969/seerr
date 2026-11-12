import DiscoverMovieStudio from '@app/components/Discover/DiscoverStudio';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const DiscoverStudioPage: NextPage = () => {
  const router = useRouter();

  if (!router.isReady || typeof router.query.studioId !== 'string') {
    return null;
  }

  return (
    <DiscoverMovieStudio
      mediaType={router.query.mediaType === 'tv' ? 'tv' : 'movie'}
    />
  );
};

export default DiscoverStudioPage;
