import { yupResolver } from "@hookform/resolvers/yup";
import { useLinkTo } from "@react-navigation/native";
import FocusAwareStatusBar from "../../../common/components/FocusAwareStatusBar";
import PrimaryButton from "../../../common/components/ThemeButtons/PrimaryButton";
import SecondaryButton from "../../../common/components/ThemeButtons/SecondaryButton";
import tw from "../../../common/tailwind";
import * as WebBrowser from "expo-web-browser";
import { mixpanelEventName } from "../../../modules/analytics/analytics";
import useAnalytics from "../../../modules/analytics/hooks/useAnalytics";
import { ControlledTextInput, FormLabel } from "../../../modules/forms";
import { handleFormSubmitException } from "../../../modules/forms/validation";
//import { useGetFFNQuery, useUnlinkFFNMutation } from 'modules/qantas/api/api';
import AnimatedSettingsHeader from "../../../modules/track/components/AnimatedSettingsHeader";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  bodyMediumRegular,
  bodySmallRegular,
  h7TextStyle,
} from "../../../theme/typography";
import * as Yup from "yup";

const schema = Yup.object({
  ffn: Yup.string().required("Please enter your Frequent Flyer number"),
  surname: Yup.string().notRequired(),
});


interface FormData {
  ffn: string;
  surname?: string;
}

const defaultValues: FormData = {
  ffn: "",
  surname: "",
};

export default function SettingsAccountsScreen() {
  const offset = useRef(new Animated.Value(0)).current;

  const linkTo = useLinkTo();

  const { sendAnalyticsEvent, sendFailedEventAnalytics } = useAnalytics();

  //const { data: qantasFFN, isLoading, isError } = useGetFFNQuery();
  // Temporary mock state to simulate API response
  const [qantasFFN, setQantasFFN] = useState<{
    link_response: { qffReference: { memberId: string } };
    surname?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

const {
  control,
  handleSubmit,
  setError,
  setValue,
  formState: { errors },
} = useForm<FormData>({
  mode: "onBlur",
  defaultValues,
  //resolver: yupResolver(schema),
});



  //Demo Data
   useEffect(() => {
    // 🔧 Simulate fetching data
    setIsLoading(true);
    setTimeout(() => {
      // Simulate success or failure
      const mockSuccess = true;

      if (mockSuccess) {
        setQantasFFN({
          link_response: { qffReference: { memberId: '123456789' } },
          surname: 'Doe',
        });
        setIsError(false);
      } else {
        setIsError(true);
      }

      setIsLoading(false);
    }, 1000);
  }, []);
//DemoData ends here


  useEffect(() => {
    if (qantasFFN) {
      setValue("ffn", qantasFFN.link_response.qffReference.memberId);
      setValue("surname", qantasFFN.surname ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qantasFFN]);

  //const [unlinkFFN, { isLoading: isUnlinkFFNLoading }] = useUnlinkFFNMutation();

  const onUnlinkFFN = handleSubmit(async () => {
    try {
      try {
        //await unlinkFFN().unwrap(); //uncommenet once actual value is there and remove the below line
        await new Promise(resolve => setTimeout(resolve, 500));

        sendAnalyticsEvent({
          event: mixpanelEventName.qantasUnlink,
          properties: {
            // What properties
          },
        });
      } catch (error: unknown) {
        // Whoopss.
        sendFailedEventAnalytics(error);
        console.error("Qantas unlink error", JSON.stringify(error));
      }
    } catch (e) {
      sendFailedEventAnalytics(e);
      handleFormSubmitException(e, setError);
    }
  });

  if (isError) {
    return (
      <View style={tw`flex-1 bg-creme`}>
        <AnimatedSettingsHeader
          animatedValue={offset}
          title="Linked accounts"
        />
        <Image
          resizeMode="cover"
          style={tw.style(
            `absolute top-0 w-[${
              Dimensions.get("window").width
            }px] bg-eggplant h-[${
              (Dimensions.get("screen").width * 271) / 374
            }px]`
          )}
          source={require("../../../../assets/ribbons/eggplant-tall.png")}
        />
        <ScrollView
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: offset } } }],
            { useNativeDriver: false }
          )}
          contentContainerStyle={tw.style("grow")}
        >
          <SafeAreaView style={tw`z-10 flex-1`}>
            <View style={tw.style("mt-15 flex-1 bg-creme px-5 pt-8")}>
              <Text style={tw.style(bodyMediumRegular, "text-center")}>
                There are no linked accounts.
              </Text>
            </View>
          </SafeAreaView>
        </ScrollView>
        <FocusAwareStatusBar statusBarStyle="light" />
      </View>
    );
  }

  if (isLoading) {
    return null;
  }

  return (
    <View style={tw`flex-1 bg-creme`}>
      <AnimatedSettingsHeader animatedValue={offset} title="Linked accounts" />
      <Image
        resizeMode="cover"
        style={tw.style(
          `absolute top-0 w-[${
            Dimensions.get("window").width
          }px] bg-eggplant h-[${
            (Dimensions.get("screen").width * 271) / 374
          }px]`
        )}
        source={require("../../../../assets/ribbons/eggplant-tall.png")}
      />
      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: offset } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={tw.style("grow")}
      >
        <SafeAreaView style={tw`z-10 flex-1`}>
          <View style={tw.style("mt-15 flex-1 bg-creme px-5 pt-8")}>
            <View
              style={tw`gap-5 rounded-2lg border border-strokecream px-6 pb-5 pt-5`}
            >
              <Image
                resizeMode="contain"
                source={require("../../../../assets/qantas/frequent-flyer.png")}
                accessibilityIgnoresInvertColors
                style={tw`mx-auto`}
              />

              <View style={tw`h-px w-full bg-strokecream`} />

              {/* Unlinked view */}
              {!qantasFFN ? (
                <View style={tw`gap-5`}>
                  <View style={tw`gap-2`}>
                    <Text
                      style={tw.style(h7TextStyle, "text-center")}
                      maxFontSizeMultiplier={1}
                    >
                      Link your Qantas Frequent Flyer account
                    </Text>
                    <Text
                      style={tw.style(
                        bodyMediumRegular,
                        "text-center text-midgray"
                      )}
                      maxFontSizeMultiplier={1}
                    >
                      Link your Qantas Frequent Flyer account and complete four
                      weekly surveys to earn 100 Qantas Points and get closer to
                      achieving Green Tier.
                    </Text>
                  </View>

                  <PrimaryButton
                    iconRight="plus"
                    onPress={() => {
                      linkTo("/qantas-link?hideRibbon=true");
                    }}
                  >
                    Link account
                  </PrimaryButton>
                </View>
              ) : (
                <View style={tw`gap-5`}>
                  <View>
                    <FormLabel error={errors.ffn}>
                      Frequent flyer number
                    </FormLabel>
                    <ControlledTextInput
                      name="ffn"
                      control={control}
                      error={errors.ffn}
                      placeholder="123456"
                      editable={false}
                    />
                  </View>

                  <View>
                    <FormLabel error={errors.surname}>Your Surname</FormLabel>
                    <ControlledTextInput
                      name="surname"
                      control={control}
                      error={errors.surname}
                      placeholder="Aaronson"
                      editable={false}
                    />
                  </View>

                  <SecondaryButton
                    onPress={onUnlinkFFN}
                    //loading={isUnlinkFFNLoading}
                  >
                    Unlink Frequent Flyer Account
                  </SecondaryButton>
                </View>
              )}
            </View>

            <View style={tw`mt-5 flex-row justify-evenly`}>
              <Pressable
                onPress={() => {
                  WebBrowser.openBrowserAsync(
                    "https://www.qantas.com/au/en/frequent-flyer/status-and-clubs/green-tier.html"
                  );
                }}
              >
                <Text
                  style={tw.style(
                    bodySmallRegular,
                    "text-center text-midgray underline"
                  )}
                >
                  What is Green Tier?
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  WebBrowser.openBrowserAsync(
                    "https://www.saveful.com/qantasterms"
                  );
                }}
              >
                <Text
                  style={tw.style(
                    bodySmallRegular,
                    "text-center text-midgray underline"
                  )}
                >
                  Terms & conditions
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
