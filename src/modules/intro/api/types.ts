interface Onboarding {
  postcode: string;
  suburb: string;
  no_of_people: {
    adults: number;
    children: number;
  };
  dietary_requirements: string[];
  allergies: string[];
  taste_preference: string[];
  track_survey_day: string;
}

interface OnboardingResponse {
  onboarding: Onboarding;
}

type LocationAutocomplete = {
  id: string;
  full_location: string;
  state_territory: string;
};

type LocationMetadata = LocationAutocomplete & {
  country: string;
  demo: false;
  latitude: string;
  locality_name: string;
  location_type: string;
  longitude: string;
  paid: true;
  postcode: string;
  street: null;
  street_name: null;
  street_suffix: null;
  street_type: null;
  success: true;
};

type AutocompleteResult = {
  success: boolean;
  completions?: LocationAutocomplete[];
};

export {
  AutocompleteResult,
  LocationAutocomplete,
  LocationMetadata,
  Onboarding,
  OnboardingResponse,
};
