import { Moment } from 'moment';

interface Challenge {
  id: string;
  data: {
    challengeStatus: string;
    joinedDate: Moment;
    noOfCooks: number;
    foodSaved: number;
  };
}

interface ChallengeResult extends Challenge {
  id: string;
  slug: string;
}

interface ChallengeResponse {
  challenge: ChallengeResult;
}

interface ChallengesResponse {
  challenge: ChallengeResult[];
}

export { Challenge, ChallengeResponse, ChallengeResult, ChallengesResponse };
