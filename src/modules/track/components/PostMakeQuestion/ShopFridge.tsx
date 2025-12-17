import { useLinkTo, useNavigation } from "@react-navigation/native";
import PrimaryButton from "../../../../common/components/ThemeButtons/PrimaryButton";
import tw from "../../../../common/tailwind";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { bodyMediumRegular, h6TextStyle } from "../../../../theme/typography";
import { RootNavigationStackParams } from "../../../navigation/navigator/root/RootNavigator";

export default function ShopFridge() {
  //const linkTo = useLinkTo();
  const navigation =
    useNavigation<RootNavigationStackParams<"Make">["navigation"]>();

  return (
    <View style={tw`h-full w-full justify-between`}>
      <ScrollView contentContainerStyle={tw`px-5`}>
        <Image
          resizeMode="contain"
          style={tw`mx-auto mb-7 h-[335px] w-[302px] max-w-full`}
          source={require("../../../../../assets/placeholder/post-fridge.png")}
          accessibilityIgnoresInvertColors
        />
        <Text
          style={tw.style(h6TextStyle, "pb-2 text-center text-white")}
          maxFontSizeMultiplier={1}
        >
          shop your fridge to see more savings!
        </Text>
        <Text
          style={tw.style(bodyMediumRegular, "pb-2 text-center text-white")}
        >
          {`Whether you cooked with ingredients already had (or not!), every time you make a Saveful meal you’re learning how to mix and match food and use up what you’ve got.
          
So, well done waste warrior. `}
        </Text>
      </ScrollView>
      <View style={tw.style("px-5")}>
        <PrimaryButton
          style={tw.style("mt-4.5 mb-2")}
          buttonSize="large"
          onPress={() => {
            // linkTo('/make');
            navigation.navigate("Make", {
              screen: "MakeHome",
            });
          }}
        >
          Done
        </PrimaryButton>
      </View>
    </View>
  );
}
