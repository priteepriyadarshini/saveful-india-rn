// import React, { useEffect } from 'react';
// import { Image, StyleSheet, View } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';

// export default function SplashScreen({ navigation }: Props) {
//   useEffect(() => {
//     const timer = setTimeout(() => navigation.replace('Loading'), 1000);
//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require('../../assets/splash.png')}
//         style={styles.image}
//         resizeMode="cover"
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//   },
// });

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function SplashPage() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/splash.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});