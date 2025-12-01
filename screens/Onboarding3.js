import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';



export default function Onboarding3() {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'CreatoDisplay-Medium': require('../assets/fonts/CreatoDisplay-Medium.otf'),
    'CreatoDisplay-Regular': require('../assets/fonts/CreatoDisplay-Regular.otf'),
    'Stretch': require('../assets/fonts/StretchPro.otf'),
  });

  return (
    <ImageBackground
      source={require('../assets/background3.png')}
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
            <Text style={styles.title1}>Pronta</Text>
            <Text style={styles.title2}>para</Text>
<Text style={styles.titleHighlight}>
  começar
  <Text style={styles.questionMark}>?</Text> {/* Este '?' terá estilo diferente */}
</Text>
            <Text style={styles.subtitle}>
              Crie Sua Conta E Transforme Seu Guarda-{'\n'}Roupa Em Um Closet Inteligente.
            </Text>
          </View>

          {/* Botões de ação */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonPrimaryText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => navigation.navigate('Cadastro')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonSecondaryText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>

          {/* Navegação */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Onboarding2')}
              activeOpacity={0.7}
            >
              <View style={styles.arrowLeft}>
                <Text style={styles.arrowIcon}>◀</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.navButtonPlaceholder} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    paddingBottom:60,
    paddingHorizontal: 20,
  },
  textContainer: {
    marginBottom: 40,
  },
  title1: {
    fontSize: 45,
    color: '#FFFFFF',
    fontFamily: 'Stretch',
    left: 60,
    top: 70
  },
  title2: {
    fontSize: 30,
    color: '#FFFFFF',
    fontFamily: 'Stretch',
    left: 25,
    top: 50
  },
  // ... dentro da definição de styles
  titleHighlight: {
    fontSize: 40,
    color: '#ffff', // Mantém a cor original para a palavra "começar", ou mude se quiser
    fontFamily: 'Stretch',
    // Remova o ponto de interrogação se ele estiver aqui
  },
  questionMark: {
    fontSize: 70, // Tamanho maior para o ponto de interrogação
    color: '#A89CF2', // Cor diferente para o ponto de interrogação (ex: dourado)// Mantém a linha consistente com a palavra "começar"
    fontFamily: 'Stretch', // Mesma fonte, ou outra se preferir
    // Talvez adicione um pequeno marginLeft se quiser um espaçamento fino
    // marginLeft: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 20,
    lineHeight: 24,
    fontFamily: 'CreatoDisplay-Regular',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom:20,
    gap: 15,
  },
  buttonPrimary: {
    backgroundColor: '#A89CF2',
    paddingVertical: 7,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    alignSelf: 'center'
  },
  buttonPrimaryText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'CreatoDisplay-Medium',
    fontWeight: 'bold'
  },
  buttonSecondary: {
    backgroundColor: '#8A38F5',
    paddingVertical: 7,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    alignSelf: 'center',
  },
  buttonSecondaryText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'CreatoDisplay-Medium',
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: -10,
  },
  navButtonPlaceholder: {
    width: 50,
    height: 50,
  },
  arrowLeft: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 25,
    color: '#fff',
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