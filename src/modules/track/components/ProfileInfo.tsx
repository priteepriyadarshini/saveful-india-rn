import tw from "../../../common/tailwind";
import { h7TextStyle, subheadMediumUppercase } from "../../../theme/typography";
import { Text } from "react-native";
import React from "react";
import { useGetCurrentUserQuery } from '../../../modules/auth/api';
import {
  DateFormats,
  useMemoizedDateFormatLabel,
} from "../../../common/hooks/useMemoizedDateFormatLabel";

export function ProfileInfo() {

  // TODO: Replace with actual user data when useGetCurrentUserQuery is available
  // const user = {
  //   first_name: 'Guest', // name values going from here
  //   last_name: ' ProfileInfo',
  //   inserted_at: '2024-09-15T10:00:00Z', // Mock account creation date
  // };

  const { data: user } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const dateCreated = useMemoizedDateFormatLabel(
    user?.inserted_at,
    DateFormats.MonthYearFull,
  );


  return (
    <>
      <Text style={tw.style(h7TextStyle, "text-white")}>{`${user?.first_name} ${
        user?.last_name ?? ""
      }`}</Text>
      <Text style={[tw.style(subheadMediumUppercase, "mt-1 text-white")]}>
        {dateCreated ? `Saveful since ${dateCreated}` : ` `}
      </Text>
    </>
  );
}
