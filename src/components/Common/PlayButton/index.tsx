import ButtonWithDropdown from '@app/components/Common/ButtonWithDropdown';
import Tooltip from '@app/components/Common/Tooltip';

interface PlayButtonProps {
  links: PlayButtonLink[];
}

export interface PlayButtonLink {
  text: string;
  url: string;
  svg: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  isTrailer?: boolean;
}

const PlayButton = ({ links }: PlayButtonProps) => {
  if (!links || !links.length) {
    return null;
  }

  const mediaLinks = links.filter((link) => !link.isTrailer);
  const trailerLinks = links.filter((link) => link.isTrailer);

  return (
    <div className="flex gap-2">
      {mediaLinks.length > 0 && (
        <ButtonWithDropdown
          as="a"
          buttonType="ghost"
          text={
            <>
              {mediaLinks[0].svg}
              <span>{mediaLinks[0].text}</span>
            </>
          }
          href={mediaLinks[0].url}
          target="_blank"
          onClick={mediaLinks[0].onClick}
        >
          {mediaLinks.length > 1 &&
            mediaLinks.slice(1).map((link, i) => (
              <ButtonWithDropdown.Item
                key={`play-button-dropdown-item-${i}`}
                buttonType="ghost"
                href={link.url}
                target="_blank"
                onClick={link.onClick}
              >
                {link.svg}
                <span>{link.text}</span>
              </ButtonWithDropdown.Item>
            ))}
        </ButtonWithDropdown>
      )}
      {trailerLinks.map((link) => (
        <Tooltip key={`play-button-trailer-${link.url}`} content={link.text}>
          <ButtonWithDropdown
            as="a"
            buttonType="ghost"
            text={link.svg}
            href={link.url}
            target="_blank"
            onClick={link.onClick}
            aria-label={link.text}
            className="border-purple-300/50 bg-gradient-to-br from-[#d0a1ff]/35 via-[#9369f5]/35 to-[#5365f4]/35 px-3 hover:border-purple-200/70 hover:from-[#d0a1ff]/45 hover:via-[#9369f5]/45 hover:to-[#5365f4]/45"
          />
        </Tooltip>
      ))}
    </div>
  );
};

export default PlayButton;
