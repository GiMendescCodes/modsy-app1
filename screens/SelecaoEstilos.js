import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { auth } from '../firebaseConfig';
import { salvarEstilos } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

export default function SelecaoEstilos() {
  const navigation = useNavigation();
  const [selecionados, setSelecionados] = useState([]);

  const [fontsLoaded] = useFonts({
    'CreatoDisplay-Medium': require('../assets/fonts/CreatoDisplay-Medium.otf'),
    'CreatoDisplay-Regular': require('../assets/fonts/CreatoDisplay-Regular.otf'),
  });

  const estilos = [
    { nome: 'casual', imagem: require('../assets/estilos/casual.png') },
    { nome: 'esportivo', imagem: require('../assets/estilos/esportivo.png') },
    { nome: 'gótico', imagem: require('../assets/estilos/gotico.png') },
    { nome: 'elegante', imagem: require('../assets/estilos/elegante.png') },
    { nome: 'vintage', imagem: require('../assets/estilos/vintage.png') },
    { nome: 'minimalista', imagem: require('../assets/estilos/minimalista.png') },
    { nome: 'streetwear', imagem: require('../assets/estilos/streetwear.png') },
    { nome: 'boho', imagem: require('../assets/estilos/boho.png') },
  ];

  const toggleEstilo = (estilo) => {
    if (selecionados.includes(estilo)) {
      setSelecionados(selecionados.filter(e => e !== estilo));
    } else if (selecionados.length < 5) {
      setSelecionados([...selecionados, estilo]);
    }
  };

  const handleContinuar = async () => {
    if (selecionados.length < 3) return;
    try {
      await salvarEstilos(auth.currentUser.uid, selecionados);
      navigation.replace('GuardaRoupa');
    } catch (error) {
      alert('Erro ao salvar estilos.');
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#050505', '#050505', '#050505']}
      style={styles.container}
    >
      <Image
        source={require('../assets/bola1.png')}
        style={styles.backgroundImage1}
        resizeMode="cover"
      />

     
      <View style={styles.outerFrame}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Selecione seus estilos</Text>
          <Text style={styles.subtitle}>Selecione pelo menos 3 estilos</Text>

     
          <View style={styles.grid}>
            {estilos.map((estilo, index) => {
              const isSelected = selecionados.includes(estilo.nome);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleEstilo(estilo.nome)}
                  style={styles.card}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.cardInner,
                    isSelected && styles.cardSelected
                  ]}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={estilo.imagem}
                        style={styles.estiloImage}
                        resizeMode="cover"
                      />
                    </View>
                    <Text style={styles.estiloNome}>{estilo.nome}</Text>

                    <View style={styles.indicator}>
                      <Text style={styles.indicatorText}>
                        {isSelected ? '✓' : '+'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

       
        {selecionados.length >= 3 && (
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleContinuar}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                Continuar ({selecionados.length}/5)
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 230,
    height: 400,
  },
  outerFrame: {
    flex: 1,
    margin: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    overflow: 'hidden',

 alignSelf: 'center',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'CreatoDisplay-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'CreatoDisplay-Regular',
    color: '#B8B8D0',
    textAlign: 'center',
    marginBottom: 30,
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    alignSelf: 'center',
  },
  card: {
    width: '48%',
    maxWidth: 160,
    alignSelf: 'center',
  },
  cardInner: {
    backgroundColor: 'rgba(141, 128, 220, 0.35)',
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    height: 189,
    width: 152,
    alignSelf: 'center',
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#7C6FD6',
    backgroundColor: 'rgba(124, 111, 214, 0.15)',
    alignSelf: 'center',
  },
  imageContainer: {
    width: 105,
    height: 90,
    overflow: 'hidden',
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 25,
  },
  estiloImage: {
    width: '100%',
    alignSelf: 'center',
    height: '100%',
    resizeMode: 'cover',
  },
  estiloNome: {
    fontSize: 16,
    fontFamily: 'CreatoDisplay-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  indicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(217, 217, 217, 0.4)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingBottom: 25,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#7C6FD6',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#7C6FD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'CreatoDisplay-Medium',
    color: '#FFFFFF',
  },
});