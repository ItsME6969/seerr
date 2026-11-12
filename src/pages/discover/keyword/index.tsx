import DiscoverKeyword from '@app/components/Discover/DiscoverKeyword';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const DiscoverKeywordPage: NextPage = () => {
  const router = useRouter();

  return (
    <DiscoverKeyword
      mediaType={router.query.mediaType === 'tv' ? 'tv' : 'movie'}
    />
  );
};

export default DiscoverKeywordPage;
