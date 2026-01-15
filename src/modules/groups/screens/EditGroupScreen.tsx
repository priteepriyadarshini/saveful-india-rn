import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import { Feather } from '@expo/vector-icons';
import {
  useGetUserGroupQuery,
  useUpdateUserGroupMutation,
} from '../../../modules/groups/api/api';
import { bodyMediumRegular, bodySmallRegular, h5TextStyle, subheadSmallUppercase } from '../../../theme/typography';

export default function EditGroupScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data } = useGetUserGroupQuery({ id });
  const [updateGroup, { isLoading }] = useUpdateUserGroupMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    if (data?.group) {
      setName(data.group.name);
      setDescription(data.group.description);
    }
  }, [data]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission required',
        'Permission to access gallery is required!',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfileImage({
        uri: asset.uri,
        name: asset.fileName || 'group-image.jpg',
        type: asset.type || 'image/jpeg',
      });
    }
  };

  const handleUpdateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a group description');
      return;
    }

    try {
      await updateGroup({
        groupId: id,
        name: name.trim(),
        description: description.trim(),
        groupProfileImage: profileImage || undefined,
      }).unwrap();

      Alert.alert('Success', 'Group updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to update group. Please try again.',
      );
    }
  };

  if (!data?.group) {
    return (
      <SafeAreaView
        style={tw.style('flex-1 items-center justify-center bg-creme')}
      >
        <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  const currentImage = profileImage?.uri || data.group.profilePhotoUrl;

  return (
    <SafeAreaView style={tw.style('flex-1 bg-creme')}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw.style('flex-1')}
      >
        <ScrollView contentContainerStyle={tw.style('pt-6 px-5 pb-5 gap-6')} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <View style={tw.style('mt-1')}>
            <DebouncedPressable onPress={() => navigation.goBack()} style={tw.style('w-10 h-10 items-center justify-center')}>
              <Feather name="arrow-left" size={24} color="#1F1F1F" />
            </DebouncedPressable>
          </View>

          {/* Header */}
          <View style={tw.style('items-center gap-1')}>
            <Text style={tw.style(h5TextStyle, 'text-center text-darkgray')}>EDIT SAVEFUL</Text>
            <Text style={tw.style(h5TextStyle, 'text-center text-darkgray')}>COMMUNITY GROUP</Text>
            <Text style={tw.style(bodyMediumRegular, 'px-4 text-center text-midgray')}>
              Update your group name, description and profile photo.
            </Text>
          </View>

          {/* Name Input */}
          <View style={tw.style('gap-2')}>
            <Text style={tw.style(subheadSmallUppercase, 'text-midgray')}>GROUP NAME</Text>
            <TextInput
              style={tw.style('rounded-xl border border-strokecream bg-white px-4 py-3 text-darkgray')}
              placeholder="Eg - The Edwards Family"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* Description Input */}
          <View style={tw.style('gap-2')}>
            <Text style={tw.style(subheadSmallUppercase, 'text-midgray')}>GROUP DESCRIPTION</Text>
            <TextInput
              style={tw.style('rounded-xl border border-strokecream bg-white px-4 py-3 text-darkgray')}
              placeholder="Tell us a little bit about your group"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
          </View>

          {/* Profile Photo Upload */}
          <View style={tw.style('gap-2')}>
            <Text style={tw.style(subheadSmallUppercase, 'text-midgray')}>PROFILE PHOTO (OPTIONAL)</Text>
            <View>
              <DebouncedPressable onPress={pickImage} style={tw.style('w-full rounded-xl border border-black bg-[#FBF4EA] px-4 py-4')}>
                <Text style={tw.style('text-center font-sans-semibold text-darkgray')}>Upload a profile photo</Text>
              </DebouncedPressable>
            </View>
          </View>

          {/* Save Button */}
          <PrimaryButton
            onPress={handleUpdateGroup}
            width="full"
            buttonSize="large"
            variant="solid-black"
            disabled={isLoading || !name.trim() || !description.trim()}
          >
            {isLoading ? 'Saving...' : 'Save changes'}
          </PrimaryButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
