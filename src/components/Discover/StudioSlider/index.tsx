import CompanyCard from '@app/components/CompanyCard';
import Slider from '@app/components/Slider';
import defineMessages from '@app/utils/defineMessages';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Discover.StudioSlider', {
  studios: 'Studios',
});

interface Studio {
  name: string;
  image: string;
  url: string;
}

const studios: Studio[] = [
  {
    name: 'Disney',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/wdrCwmRnLFJhEoH8GSfymY85KHT.png',
    url: '/discover/studio/2?mediaType=movie',
  },
  {
    name: '20th Century Studios',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/h0rjX5vjW5r8yEnUBStFarjcLT4.png',
    url: '/discover/studio/127928?mediaType=movie',
  },
  {
    name: 'Sony Pictures',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/GagSvqWlyPdkFHMfQ3pNq6ix9P.png',
    url: '/discover/studio/34?mediaType=movie',
  },
  {
    name: 'Warner Bros. Pictures',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/ky0xOc5OrhzkZ1N6KyUxacfQsCk.png',
    url: '/discover/studio/174?mediaType=movie',
  },
  {
    name: 'Universal',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/8lvHyhjr8oUKOOy2dKXoALWKdp0.png',
    url: '/discover/studio/33?mediaType=movie',
  },
  {
    name: 'Paramount',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/fycMZt242LVjagMByZOLUGbCvv3.png',
    url: '/discover/studio/4?mediaType=movie',
  },
  {
    name: 'Pixar',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/1TjvGVDMYsj6JBxOAkUHpPEwLf7.png',
    url: '/discover/studio/3?mediaType=movie',
  },
  {
    name: 'Dreamworks',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/kP7t6RwGz2AvvTkvnI1uteEwHet.png',
    url: '/discover/studio/521?mediaType=movie',
  },
  {
    name: 'Marvel Studios',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/hUzeosd33nzE5MCNsZxCGEKTXaQ.png',
    url: '/discover/studio/420?mediaType=movie',
  },
  {
    name: 'DC',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/2Tc1P3Ac8M479naPp1kYT3izLS5.png',
    url: '/discover/studio/9993?mediaType=movie',
  },
  {
    name: 'A24',
    image:
      'https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bababa)/1ZXsGaFPgrgS6ZZGS37AqD5uU12.png',
    url: '/discover/studio/41077?mediaType=movie',
  },
];

const StudioSlider = () => {
  const intl = useIntl();

  return (
    <>
      <div className="slider-header">
        <div className="slider-title">
          <span>{intl.formatMessage(messages.studios)}</span>
        </div>
      </div>
      <Slider
        sliderKey="studios"
        isLoading={false}
        isEmpty={false}
        items={studios.map((studio, index) => (
          <CompanyCard
            key={`studio-${index}`}
            name={studio.name}
            image={studio.image}
            url={studio.url}
          />
        ))}
        emptyMessage=""
      />
    </>
  );
};

export default StudioSlider;
