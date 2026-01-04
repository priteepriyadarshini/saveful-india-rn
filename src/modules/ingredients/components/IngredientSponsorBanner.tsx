import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import tw from '../../../common/tailwind';
import HackOrTipSponsor from '../../make/components/HackOrTipSponsor';
import { hackApiService } from '../../hack/api/hackApiService';
import { ISponsor } from '../../../models/craft';

function transformSponsor(api: { _id: string; title: string; broughtToYouBy?: string; tagline?: string; logo?: string; logoBlackAndWhite?: string }): ISponsor {
  const logoBW = api.logoBlackAndWhite ? [{ id: api._id, title: api.title, url: api.logoBlackAndWhite, uid: api._id }] : [];
  const logo = api.logo ? [{ id: api._id, title: api.title, url: api.logo, uid: api._id }] : [];
  return {
    id: api._id,
    title: api.title,
    sponsorLogo: logo,
    sponsorLogoBlackAndWhite: logoBW,
    broughtToYouBy: api.broughtToYouBy ?? 'Sponsored by',
    sponsorTagline: api.tagline ?? '',
    uid: api._id,
  } as ISponsor;
}

export default function IngredientSponsorBanner({ sponsorId }: { sponsorId: string }) {
  const [sponsor, setSponsor] = useState<ISponsor | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const apiSponsor = await hackApiService.getSponsorById(sponsorId);
        const transformed = transformSponsor(apiSponsor);
        setSponsor(transformed);
      } catch (e) {
        console.error('Failed to load sponsor', e);
      }
    };
    if (sponsorId) load();
  }, [sponsorId]);

  if (!sponsor) return null;

  return (
    <View style={tw`items-end`}>{/* align with Facts layout */}
      <HackOrTipSponsor sponsorTitle={sponsor.broughtToYouBy ?? 'Sponsored by'} {...sponsor} />
    </View>
  );
}
