import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';


export default function Onboarding2() {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'CreatoDisplay-Medium': require('../assets/fonts/CreatoDisplay-Medium.otf'),
     'CreatoDisplay-Regular': require('../assets/fonts/CreatoDisplay-Regular.otf'),
     'Stretch': require('../assets/fonts/StretchPro.otf'),
  });
  return (
    <ImageBackground
      source={require('../assets/background2.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Overlay escuro para melhorar a legibilidade */}
      <View style={styles.overlay} />
     
      <View style={styles.container}>
        {/* Logo Modsy no topo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
            />
          </View>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title1}>LOOKS</Text>
            <Text style={styles.title2}>SEM</Text>
            <Text style={styles.title3}>ESFORÇO</Text>
           
            <Text style={styles.subtitle}>
              Deixe a IA Sugerir Combinações Incríveis{'\n'}e Ganhe Tempo Todos os Dias.
            </Text>
          </View>

          {/* Indicador de página */}
          <View style={styles.pageIndicator}>
           
          </View>

          {/* Navegação */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Onboarding1')}
              activeOpacity={0.7}
            >
              <View style={styles.arrowLeft}>
                <Text style={styles.arrowIcon}>◀</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dots}>
              <View style={styles.dotInactive} />
              <View style={styles.dotActive} />
              <View style={styles.dotInactive} />
            </View>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Onboarding3')}
              activeOpacity={0.7}
            >
              <View style={styles.arrowRight}>
                <Text style={styles.arrowIcon1}>▶</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
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
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 20,
    alignItems: 'flex-end',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 140,
    height: 60,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 50,
    paddingHorizontal: 30,
  },
  textContainer: {
    marginBottom: 40,
  },
  title1: {
    fontSize: 40,
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: 'Stretch',
    top: 20
  },
  title2: {
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: 1,
    lineHeight: 35,
    fontFamily: 'Stretch',
    top: 12
  },
  title3: {
    fontSize: 40,
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: 'Stretch',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 20,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'CreatoDisplay-Regular',
    textAlign: 'center'
  },
  pageIndicator: {
    marginBottom: 30,
  },

  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 10,
  },
  arrowLeft: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowRight: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 25,
    color: '#fff',
    fontWeight: 'bold',
  },
  arrowIcon1: {
    fontSize: 25,
    color: '#A89CF2',
    fontWeight: 'bold',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dotInactive: {
    width: 40,
    height: 6,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 2,
  },
  dotActive: {
    width: 40,
    height: 6,
    backgroundColor: '#A89CF2',
    borderRadius: 2,
  },
});
