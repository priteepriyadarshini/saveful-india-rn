import { View, Text, Image } from "react-native";
import { bundledSource } from "../../../common/helpers/uriHelpers";
import tw from "../../../common/tailwind";
import { IAsset } from "../../../models/craft";
import { subheadSmallUppercase } from "../../../theme/typography";
import useEnvironment from "../../environment/hooks/useEnvironment";

export default function HackSponsor({
  sponsorLogo,
}: {
  sponsorLogo: IAsset[];
}) {
  const env = useEnvironment();

  if (!sponsorLogo[0].url) {
    return null;
  }

  return (
    <View
      style={tw.style(
        'top-5 mx-auto mt-4 flex-row items-center justify-center rounded-2lg border border-strokecream bg-white px-5 py-2',
      )}
    >
      <Text style={tw.style(subheadSmallUppercase, 'mr-2')}>
        Brought to you by
      </Text>
      <Image
        resizeMode="contain"
        style={tw`mr-2.5 h-[32px] w-[61px] rounded-2lg`}
        source={bundledSource(sponsorLogo[0].url, env.useBundledContent)}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
