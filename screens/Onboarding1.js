import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';

export default function Onboarding1() {
  const navigation = useNavigation();
const [fontsLoaded] = useFonts({
    'CreatoDisplay-Medium': require('../assets/fonts/CreatoDisplay-Medium.otf'),
     'CreatoDisplay-Regular': require('../assets/fonts/CreatoDisplay-Regular.otf'),
  });


  return (
    <ImageBackground
      source={require('../assets/background1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
     
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Logo substituída pela imagem */}
          <View style={styles.logoContainer}>
            <Image source={require('../assets/logob.png')} style={styles.logoImage} />
          </View>

   
          <Text style={styles.description}>
            Descubra Combinações Perfeitas com a{ "\n" }Ajuda da IA e Transforme seu Guarda-{ "\n" }Roupa em Estilo sem Esforço!
          </Text>

       
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Onboarding2')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 70,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 370,
    height: 140,
    resizeMode: 'contain',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    fontFamily: 'CreatoDisplay-Regular',
  },
  button: {
    backgroundColor: '#B8B5FF',
    paddingVertical: 7,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
