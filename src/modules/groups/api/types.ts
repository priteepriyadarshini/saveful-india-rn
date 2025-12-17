type GroupMemberRole = 'admin' | 'member';
enum GroupMemberRoleEnum {
  Admin = 'admin',
  Member = 'member',
}

interface GroupMember {
  id: string;
  group_id: string;
  group: Group;
  role: GroupMemberRole;
  is_owner: boolean;
  first_name: string;
}

interface GroupBanner {
  file_name: string;
  url: string;
  updated_at: Date;
}

interface ImageFileInfo {
  uri: string;
  name: string;
  type?: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  banner: GroupBanner;
  is_owner: boolean;
  code: string;
  total: number;
  food_savings: string;
}

interface GroupResponse {
  data: Group | null;
}

interface GroupsResponse {
  data: Group[] | null;
}

interface GroupChallengeParticipant {
  id: string;
  first_name: string;
  group_challenge_id: string;
  group_member_id: string;
  is_deleted: boolean;
  progress: {
    completed_meals_count: number;
    food_saved: number;
  };
}

type GroupChallengeState = 'upcoming' | 'active' | 'ended' | 'cancelled';
enum GroupChallengeStateEnum {
  Upcoming = 'upcoming',
  Active = 'active',
  Ended = 'ended',
  Cancelled = 'cancelled',
}

interface GroupChallenge {
  id: string;
  name: string;
  type: 'group';
  state: GroupChallengeState;
  group_id: string;
  start_at: Date;
  end_at: Date;
  description: string;
  created_by: string;
  is_deleted: boolean;
  participants: GroupChallengeParticipant[];
  targets: {
    key: string;
    value: number;
  }[];
  progress: {
    completed_meals_count: number;
    food_saved: number;
  };
}

interface GroupChallengeResponse {
  challenge: GroupChallenge | null;
}

interface GroupChallengesResponse {
  challenges: GroupChallenge[] | null;
}

export {
  Group,
  GroupBanner,
  GroupChallenge,
  GroupChallengeParticipant,
  GroupChallengeResponse,
  GroupChallengeState,
  GroupChallengeStateEnum,
  GroupChallengesResponse,
  GroupMember,
  GroupMemberRole,
  GroupMemberRoleEnum,
  GroupResponse,
  GroupsResponse,
  ImageFileInfo,
};
