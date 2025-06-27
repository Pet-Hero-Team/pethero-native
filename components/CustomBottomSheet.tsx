import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import Colors from '../constants/Colors';
import ChatView from './ChatView';
export type Ref = BottomSheet;

interface Props {
  channelId: string;
}

const CustomBottomSheet = forwardRef<Ref, Props>((props, ref) => {
  const snapPoints = useMemo(() => ['15%', '100%'], []);

  return (
    <BottomSheet
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      handleIndicatorStyle={{ backgroundColor: Colors.primary }}
      backgroundStyle={{ backgroundColor: '#fff' }}>
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.containerHeadline}>Chat</Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={120}
          style={{ flex: 1 }}>
          <ChatView channelId={props.channelId} />
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
});

CustomBottomSheet.displayName = 'CustomBottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  containerHeadline: {
    fontSize: 24,
    fontWeight: '600',
    padding: 20,
    textAlign: 'center',
  },
});

export default CustomBottomSheet;
