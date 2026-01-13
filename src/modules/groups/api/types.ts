type GroupMemberRole = 'OWNER' | 'MEMBER';
enum GroupMemberRoleEnum {
  Owner = 'OWNER',
  Member = 'MEMBER',
}

interface GroupMember {
  _id: string;
  groupId: string;
  userId: {
    _id: string;
    name: string;
    email?: string;
  };
  role: GroupMemberRole;
  isActive: boolean;
  joinedAt: Date;
  joinedViaCode?: string;
  reJoined?: boolean;
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
  _id: string;
  name: string;
  description: string;
  profilePhotoUrl?: string;
  joinCode: string;
  ownerId: string | {
    _id: string;
    name: string;
    email?: string;
  };
  memberCount: number;
  totalFoodSaved?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GroupResponse {
  group: Group;
  members: GroupMember[];
}

interface GroupsResponse {
  data: Group[] | null;
}

interface GroupChallengeParticipant {
  _id: string;
  userId: string | { _id: string; name: string; email?: string };
  communityId: string;
  challengeId: string;
  isActive: boolean;
  totalFoodSaved?: number;
  totalMealsCompleted?: number;
  joinedAt: Date;
}

interface GroupChallenge {
  _id: string;
  communityId: string;
  createdBy: string;
  challengeName: string;
  description: string;
  startDate: Date;
  endDate: Date;
  challengeGoal: number;
  memberCount: number;
  totalFoodSaved?: number;
  totalMealsCompleted?: number;
  isActive: boolean;
  status?: boolean;
  isParticipant?: boolean;
  // Optional: backend may include participants in challenge payload
  participants?: GroupChallengeParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

interface GroupChallengeResponse {
  challenge: GroupChallenge | null;
}

interface GroupChallengesResponse {
  challenges: GroupChallenge[] | null;
  userParticipation?: { challengeId: string; totalMealsCompleted: number }[];
}

export {
  Group,
  GroupBanner,
  GroupChallenge,
  GroupChallengeParticipant,

  GroupMember,
  GroupMemberRole,
  GroupMemberRoleEnum,
  GroupResponse,
  GroupsResponse,
  ImageFileInfo,
};
