import { ApiHackOrTip, ApiSponsor } from '../api/hackOrTipApiService';
import { IHackOrTip, IAsset, ISponsor } from '../../../models/craft';

function toAsset(url?: string, id?: string, title?: string): IAsset | undefined {
  if (!url) return undefined;
  return {
    id: id || url,
    title: title || '',
    url,
    uid: id || url,
  };
}

function transformSponsor(apiSponsor?: ApiSponsor | string | null): ISponsor | undefined {
  if (!apiSponsor || typeof apiSponsor === 'string') return undefined;
  const logoBW = toAsset(apiSponsor.logoBlackAndWhite, apiSponsor._id, apiSponsor.title);
  const logo = toAsset(apiSponsor.logo, apiSponsor._id, apiSponsor.title);
  return {
    id: apiSponsor._id,
    title: apiSponsor.title,
    sponsorLogo: logo ? [logo] : [],
    sponsorLogoBlackAndWhite: logoBW ? [logoBW] : [],
    broughtToYouBy: apiSponsor.broughtToYouBy || '',
    sponsorTagline: apiSponsor.tagline || '',
    uid: apiSponsor._id,
  } as ISponsor;
}

export function transformHackOrTip(api: ApiHackOrTip): IHackOrTip {
  const sponsorTransformed = transformSponsor(api.sponsorId);

  return {
    id: api._id,
    title: api.title,
    uid: api._id,
    shortDescription: api.shortDescription,
    description: api.description || null,
    hackOrTipType: api.type as IHackOrTip['hackOrTipType'],
    sponsor: sponsorTransformed ? [sponsorTransformed] : [],
    sponsorHeading: sponsorTransformed ? 'Sponsored by' : null,
  } as IHackOrTip;
}
