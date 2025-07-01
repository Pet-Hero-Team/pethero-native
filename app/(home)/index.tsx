import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const index = () => {
  return (
    <View>
      <Text>type</Text>
      <Link href={"/(home)/(tabs)"}>
        <Text>채팅</Text></Link>
    </View>
  );
};

export default index;
