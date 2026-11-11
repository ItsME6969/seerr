import globalMessages from '@app/i18n/globalMessages';
import defineMessages from '@app/utils/defineMessages';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Common.TrailerModal', {
  title: '{title} trailer',
  watchOnYoutube: 'Watch on YouTube',
});

interface YoutubePlayer {
  getCurrentTime: () => number;
  pauseVideo: () => void;
  destroy: () => void;
}

interface YoutubeApi {
  Player: new (
    element: HTMLElement,
    options: { events?: { onReady?: () => void } }
  ) => YoutubePlayer;
}

declare global {
  interface Window {
    YT?: YoutubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface TrailerModalProps {
  videoKey: string;
  title: string;
  onClose: () => void;
}

const TrailerModal = ({ videoKey, title, onClose }: TrailerModalProps) => {
  const intl = useIntl();
  const panelRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YoutubePlayer | undefined>(undefined);
  const [youtubeUrl, setYoutubeUrl] = useState(
    `https://www.youtube.com/watch?v=${encodeURIComponent(videoKey)}`
  );
  const trailerTitle = intl.formatMessage(messages.title, { title });

  useEffect(() => {
    let cancelled = false;

    const createPlayer = () => {
      if (!cancelled && iframeRef.current && window.YT?.Player) {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onReady: () => {
              if (!cancelled) {
                setYoutubeUrl(
                  `https://www.youtube.com/watch?v=${encodeURIComponent(videoKey)}`
                );
              }
            },
          },
        });
      }
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        createPlayer();
      };
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = undefined;
    };
  }, [videoKey]);

  const openYoutube = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const currentTime = Math.floor(playerRef.current?.getCurrentTime() ?? 0);
    const url = new URL(youtubeUrl);
    if (currentTime > 0) {
      url.searchParams.set('t', `${currentTime}s`);
    }
    playerRef.current?.pauseVideo();
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog
      open
      onClose={onClose}
      initialFocus={panelRef}
      className="relative z-50"
    >
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <DialogPanel
          ref={panelRef}
          tabIndex={-1}
          className="relative w-[92vw] max-w-[1200px] overflow-hidden rounded-lg bg-gradient-to-br from-[#d0a1ff]/50 via-[#9369f5]/50 to-[#5365f4]/50 p-[2px] shadow-xl focus:outline-none"
        >
          <DialogTitle className="sr-only">{trailerTitle}</DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="sr-only focus:not-sr-only focus:absolute focus:right-2 focus:top-2 focus:z-10 focus:rounded focus:bg-gray-900 focus:p-2 focus:text-white"
          >
            {intl.formatMessage(globalMessages.close)}
          </button>
          <div className="relative aspect-video w-full overflow-hidden rounded-[6px] bg-black">
            <iframe
              ref={iframeRef}
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoKey)}?autoplay=0&mute=0&playsinline=1&enablejsapi=1`}
              title={trailerTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <a
              href={youtubeUrl}
              onClick={openYoutube}
              target="_blank"
              rel="noreferrer"
              aria-label={intl.formatMessage(messages.watchOnYoutube)}
              className="absolute left-0 top-0 z-10 h-16 w-3/4"
            />
            <a
              href={youtubeUrl}
              onClick={openYoutube}
              target="_blank"
              rel="noreferrer"
              aria-label={intl.formatMessage(messages.watchOnYoutube)}
              className="absolute bottom-0 right-0 z-10 h-16 w-44"
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TrailerModal;
