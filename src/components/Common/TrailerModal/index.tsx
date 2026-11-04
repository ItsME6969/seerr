import globalMessages from '@app/i18n/globalMessages';
import defineMessages from '@app/utils/defineMessages';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useRef } from 'react';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Common.TrailerModal', {
  title: '{title} trailer',
});

interface TrailerModalProps {
  videoKey: string;
  title: string;
  onClose: () => void;
}

const TrailerModal = ({ videoKey, title, onClose }: TrailerModalProps) => {
  const intl = useIntl();
  const panelRef = useRef<HTMLDivElement>(null);
  const trailerTitle = intl.formatMessage(messages.title, { title });

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
          className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-gradient-to-br from-[#d0a1ff] via-[#9369f5] to-[#5365f4] p-[2px] shadow-xl focus:outline-none"
        >
          <DialogTitle className="sr-only">{trailerTitle}</DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="sr-only focus:not-sr-only focus:absolute focus:right-2 focus:top-2 focus:z-10 focus:rounded focus:bg-gray-900 focus:p-2 focus:text-white"
          >
            {intl.formatMessage(globalMessages.close)}
          </button>
          <div className="aspect-video w-full overflow-hidden rounded-[6px] bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoKey)}?autoplay=0&mute=0&playsinline=1`}
              title={trailerTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TrailerModal;
