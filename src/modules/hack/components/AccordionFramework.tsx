import { useLinkTo, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { bundledSource } from "../../../common/helpers/uriHelpers";
import useContent from "../../../common/hooks/useContent";
import tw from "../../../common/tailwind";
import { IFramework } from "../../../models/craft";
import { cardDrop } from "../../../theme/shadow";
import { h7TextStyle } from "../../../theme/typography";
import useEnvironment from "../../environment/hooks/useEnvironment";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { InitialStackParamList } from "../../navigation/navigator/InitialNavigator";

export default function AccordionFramework({ item }: { item: any }) {
  //const linkTo = useLinkTo();
  const [framework, setFramework] = useState<IFramework>();

  const { getFramework } = useContent();
  const env = useEnvironment();

  // Navigation prop
  type InitialNav = NativeStackNavigationProp<InitialStackParamList, "Root">;
  const navigation = useNavigation<InitialNav>();

  const getFrameworksData = async (id: string) => {
    const data = await getFramework(id);

    if (data) {
      setFramework(data);
    }
  };

  useEffect(() => {
    getFrameworksData(item.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!framework) return null;

  return (
    <Pressable
      onPress={() => {
        //linkTo(`/make/prep/${framework.slug}`);
        navigation.navigate('Root', {
          screen: 'Make',
          params: {
            screen: 'PrepDetail',
            params: { slug: framework.slug },
          },
        });
      }}
      style={tw.style(
        "items-center rounded-md border border-strokecream bg-white p-2.5",
        cardDrop
      )}
      key={item.id}
    >
      {framework && (
        <View style={tw.style("w-full")}>
          {framework?.heroImage && (
            <View>
              <Image
                resizeMode="cover"
                style={tw`h-[235px] w-full rounded-md`}
                source={bundledSource(
                  framework?.heroImage[0].url,
                  env.useBundledContent
                )}
                accessibilityIgnoresInvertColors
              />
            </View>
          )}
          <Text style={tw.style(h7TextStyle, "mt-3 text-center")}>
            {framework.title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
