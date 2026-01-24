import React, { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import tw from '../../../common/tailwind';
import EggplantButton from '../../../common/components/ThemeButtons/EggplantButton';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import OutlineButton from '../../../common/components/ThemeButtons/OutlineButton';
import ModalComponent from '../../../modules/groups/components/ModalComponent';
import { useJoinUserGroupMutation } from '../../../modules/groups/api/api';
import { bodySmallRegular, h7TextStyle } from '../../../theme/typography';

interface JoinGroupModalProps {
  onJoin?: (message: string) => void;
}

export default function JoinGroupModal({ onJoin }: JoinGroupModalProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinGroup, { isLoading }] = useJoinUserGroupMutation();

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }

    try {
      const result = await joinGroup({ code: joinCode.trim() }).unwrap();
      setIsModalVisible(false);
      setJoinCode('');
      const { getSafeErrorMessage } = require('../../../modules/forms/validation');
      Alert.alert('Success', getSafeErrorMessage(result, 'Joined group successfully!'));
      onJoin?.(result.message);
    } catch (error: any) {
      const { getSafeErrorMessage } = require('../../../modules/forms/validation');
      Alert.alert(
        'Error',
        getSafeErrorMessage(error, 'Failed to join group. Please check your code and try again.'),
      );
    }
  };

  return (
    <>
      <EggplantButton onPress={() => setIsModalVisible(true)}>
        Join a group
      </EggplantButton>

      <ModalComponent
        heading="Join a Group"
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      >
        <View style={tw.style('items-center gap-4')}>
          <Text
            style={tw.style(bodySmallRegular, 'text-center text-midgray')}
          >
            Enter the invite code shared by a group member or owner
          </Text>
          <TextInput
            style={tw.style(
              'w-full rounded-lg border border-strokecream bg-white px-4 py-3 text-center font-saveful-semibold text-lg uppercase tracking-wider text-darkgray',
            )}
            placeholder="ENTER CODE"
            placeholderTextColor="#999"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />
          <View style={tw.style('w-full flex-row gap-2')}>
            <OutlineButton
              onPress={() => {
                setIsModalVisible(false);
                setJoinCode('');
              }}
              style={tw.style('flex-1')}
            >
              Cancel
            </OutlineButton>
            <PrimaryButton
              onPress={handleJoinGroup}
              style={tw.style('flex-1')}
              disabled={isLoading || !joinCode.trim()}
            >
              {isLoading ? 'Joining...' : 'Join'}
            </PrimaryButton>
          </View>
        </View>
      </ModalComponent>
    </>
  );
}
