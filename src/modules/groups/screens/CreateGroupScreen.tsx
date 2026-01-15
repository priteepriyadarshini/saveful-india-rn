import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import tw from '../../../common/tailwind';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import { Feather } from '@expo/vector-icons';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import { useCreateUserGroupMutation } from '../../../modules/groups/api/api';
import { bodyMediumRegular, bodySmallRegular, h5TextStyle, subheadSmallUppercase } from '../../../theme/typography';
import { GroupsStackParamList } from '../navigation/GroupsNavigator';

export default function CreateGroupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<GroupsStackParamList>>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const [createGroup, { isLoading }] = useCreateUserGroupMutation();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access gallery is required!');
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

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a group description');
      return;
    }

    try {
      const result = await createGroup({
        name: name.trim(),
        description: description.trim(),
        profileImage: profileImage || undefined,
      }).unwrap();

      Alert.alert('Success', 'Group created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (result._id) {
              navigation.navigate('GroupDetail', { id: result._id });
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error('Create group error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || error?.message || 'Failed to create group. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={tw.style('flex-1 bg-creme')}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw.style('flex-1')}
      >
        <ScrollView contentContainerStyle={tw.style('pt-6 px-5 pb-5 gap-6')} keyboardShouldPersistTaps="handled">
          <View style={tw.style('mt-1')}>
            <DebouncedPressable
              onPress={() => navigation.goBack()}
              style={tw.style('w-10 h-10 items-center justify-center')}
            >
              <Feather name="arrow-left" size={24} color="#1F1F1F" />
            </DebouncedPressable>
          </View>
          <View style={tw.style('items-center gap-3')}>
            <View style={tw.style('items-center gap-0')}>
              <Text style={tw.style(h5TextStyle, 'text-center text-darkgray')}>
                CREATE A SAVEFUL
              </Text>
              <Text style={tw.style(h5TextStyle, 'text-center text-darkgray')}>
                COMMUNITY GROUP
              </Text>
            </View>
            <Text style={tw.style(bodyMediumRegular, 'px-4 text-center text-midgray')}>
              Create a group for your workplace, apartment block, school or whoever you like! Once created, you’ll need to share your unique Group Code with people so they can join your Saveful crew.
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
              <DebouncedPressable
                onPress={pickImage}
                style={tw.style('w-full rounded-xl border border-black bg-[#FBF4EA] px-4 py-4')}
              >
                <Text style={tw.style('text-center font-sans-semibold text-darkgray')}>
                  Upload a profile photo
                </Text>
              </DebouncedPressable>
            </View>
          </View>

          {/* Create Button */}
          <PrimaryButton
            onPress={handleCreateGroup}
            width="full"
            buttonSize="large"
            variant="solid-black"
            disabled={isLoading || !name.trim() || !description.trim()}
          >
            {isLoading ? 'Creating...' : 'Create group'}
          </PrimaryButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
