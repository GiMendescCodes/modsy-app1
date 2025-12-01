// screens/GuardaRoupa.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  salvarPeca,
  carregarPecas,
  excluirPeca,
  salvarLook,
} from "../services/authService";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as FileSystem from "expo-file-system/legacy";

export default function GuardaRoupa() {
  const navigation = useNavigation();
  const [pecas, setPecas] = useState({
    superior: [],
    inferior: [],
    unica: [],
    sapato: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [imagemUri, setImagemUri] = useState(null);
  const [tipo, setTipo] = useState("superior");
  const [tipoEspecifico, setTipoEspecifico] = useState("");
  const [cor, setCor] = useState("");
  const [estilo, setEstilo] = useState("");
  const [tecido, setTecido] = useState("");
  const [estampa, setEstampa] = useState("");
  const [descricaoEstampa, setDescricaoEstampa] = useState("");
  const [textura, setTextura] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [showSugestaoModal, setShowSugestaoModal] = useState(false);
  const [ocasiao, setOcasiao] = useState("");
  const [cidade, setCidade] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pecaToDelete, setPecaToDelete] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState("unico"); // "unico" ou "completo"
  const [sugestaoEnviada, setSugestaoEnviada] = useState(false);
  const [lookAtualIndex, setLookAtualIndex] = useState(0);

  // Carregar peças
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      carregarPecas(uid)
        .then((dados) => {
          const normalizePecas = (lista) =>
            lista.map((p) => ({
              ...p,
              uri: p.uri || p.imageUrl,
            }));
          setPecas({
            superior: normalizePecas(dados.superior || []),
            inferior: normalizePecas(dados.inferior || []),
            unica: normalizePecas(dados.unica || []),
            sapato: normalizePecas(dados.sapato || []),
          });
        })
        .catch((err) => {
          console.error("Erro ao carregar peças:", err);
          Alert.alert("Erro", "Não foi possível carregar seu guarda-roupa.");
        });
    }
  }, []);

  // Permissões de mídia
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted" || cameraStatus.status !== "granted") {
          Alert.alert(
            "Permissões necessárias",
            "Precisamos de acesso à câmera e galeria."
          );
        }
      }
    })();
  }, []);

  const fecharModalAdicionarPeca = () => {
    setLoading(false);
    setRemovingBg(false);
    setImagemUri(null);
    setTipo("superior");
    setTipoEspecifico("");
    setCor("");
    setEstilo("");
    setTecido("");
    setEstampa("");
    setDescricaoEstampa("");
    setTextura("");
    setModalVisible(false);
  };

  // --------- FUNÇÕES (IMAGEM, PEÇA, IA, ETC.) - INICIO ---------
  const removeBackground = async (localUri) => {
    if (!localUri || typeof localUri !== "string") {
      Alert.alert("Erro", "Imagem inválida.");
      return null;
    }
    setRemovingBg(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        Alert.alert("Erro", "Arquivo não encontrado.");
        return null;
      }
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_file_b64: base64,
          size: "regular",
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro Remove.bg:", errorText);
        Alert.alert("Erro", "Falha ao remover fundo.");
        return localUri;
      }
      const arrayBuffer = await response.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      const base64Image = btoa(binary);
      const outputPath = `${
        FileSystem.cacheDirectory
      }sem_fundo_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(outputPath, base64Image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return outputPath;
    } catch (error) {
      console.error("Erro removeBackground:", error);
      Alert.alert("Erro", "Falha ao processar imagem.");
      return localUri;
    } finally {
      setRemovingBg(false);
    }
  };

  const selecionarImagem = async (origem) => {
    let result;
    try {
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      };
      if (origem === "camera") {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }
    } catch (error) {
      console.error("Erro ao abrir seletor:", error);
      Alert.alert("Erro", "Falha ao acessar câmera/galeria.");
      return;
    }
    if (result.canceled || !result.assets?.[0]) return;
    let uri = result.assets[0].uri;
    if (Platform.OS === "android" && uri.startsWith("content://")) {
      const fileName = uri.split("/").pop() || "imagem.jpg";
      const cacheFileUri = `${FileSystem.cacheDirectory}${fileName}`;
      try {
        await FileSystem.copyAsync({ from: uri, to: cacheFileUri });
        uri = cacheFileUri;
      } catch (copyError) {
        console.error("Erro ao copiar imagem:", copyError);
        Alert.alert("Erro", "Não foi possível carregar a imagem.");
        return;
      }
    }
    if (removingBg) return;
    const imagemProcessada = await removeBackground(uri);
    setImagemUri(imagemProcessada);
  };

  const handleAdicionarPeca = () => {
    setModalVisible(true);
  };

  const salvarPecaLocal = async () => {
    if (!auth.currentUser?.uid) {
      Alert.alert("Erro", "Você não está logado.");
      return;
    }
    const uid = auth.currentUser.uid;
    if (!imagemUri) {
      Alert.alert("Erro", "Selecione uma imagem.");
      return;
    }
    if (!tipoEspecifico.trim() || !cor.trim() || !estilo.trim()) {
      Alert.alert(
        "Erro",
        "Preencha os campos obrigatórios: tipo, cor e estilo."
      );
      return;
    }
    setLoading(true);
    try {
      const peca = {
        categoria: tipo,
        tipo: tipoEspecifico.trim(),
        cor: cor.trim(),
        estilo: estilo.trim(),
        tecido: tecido.trim() || null,
        estampa: estampa,
        descricaoEstampa:
          estampa === "sim" ? descricaoEstampa.trim() || null : null,
        textura: textura.trim() || null,
        imageUrl: imagemUri,
      };
      const pecaId = await salvarPeca(uid, peca);
      setPecas((prev) => ({
        ...prev,
        [tipo]: [...prev[tipo], { ...peca, id: pecaId, uri: imagemUri }],
      }));
      fecharModalAdicionarPeca();
      Alert.alert("Sucesso", "Peça adicionada!");
    } catch (error) {
      console.error("Erro ao salvar peça:", error);
      Alert.alert("Erro", "Não foi possível salvar a peça.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirPeca = (pecaId, categoria) => {
    setPecaToDelete({ id: pecaId, categoria });
    setShowConfirmModal(true);
  };

  const buscarTemperatura = async (cidade) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          cidade
        )}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      if (response.status === 401) {
        console.warn("Chave da OpenWeatherMap inválida.");
        return 22;
      }
      if (response.status === 404) {
        Alert.alert(
          "Cidade não encontrada",
          `Não encontramos a cidade "${cidade}".\nPor favor, digite o nome completo de uma cidade válida (ex: "São Paulo", "Rio de Janeiro").`
        );
        throw new Error("Cidade inválida");
      }
      if (!response.ok) {
        console.warn("Erro na API de clima:", response.status);
        return 22;
      }
      const data = await response.json();
      return data.main?.temp ? Math.round(data.main.temp) : 22;
    } catch (error) {
      console.error("Erro na API de clima:", error);
      if (error.message !== "Cidade inválida") {
        Alert.alert("Erro", "Não foi possível obter a temperatura.");
      }
      return 22;
    }
  };

  const handleSugerirLook = () => {
    setShowSugestaoModal(true);
  };

  // ✅ Nova função com Gemini
  const handleGerarSugestao = async () => {
    if (!ocasiao.trim() || !cidade.trim()) {
      Alert.alert("Atenção", "Preencha ocasião e cidade.");
      return;
    }
    setIaLoading(true);
    setSugestoes([]);
    try {
      // 🔧 Fallback imediato para desenvolvimento (IA desativada por cota)
      console.log(
        "⚠️ IA desativada temporariamente (cota excedida). Usando fallback."
      );
      // (Opcional) Simular busca de temperatura para UX mais realista
      let temperatura = 22;
      try {
        temperatura = await buscarTemperatura(cidade.trim());
      } catch (e) {
        // Ignorar erro de cidade — fallback mantém 22°C
      }
      const todasPecas = [
        ...pecas.superior,
        ...pecas.inferior,
        ...pecas.unica,
        ...pecas.sapato,
      ];
      if (todasPecas.length === 0) {
        Alert.alert("Atenção", "Seu guarda-roupa está vazio!");
        setIaLoading(false);
        return;
      }
      // ✅ Usa apenas o fallback automático
      const fallback = gerarLooksFallback(todasPecas).slice(0, 2);
      setSugestoes(fallback);
      setLookAtualIndex(0);
      setSugestaoEnviada(true); // ✅ Ativa a tela de looks
    } catch (error) {
      console.error("Erro no fallback (inesperado):", error);
      Alert.alert("Erro", "Falha ao gerar sugestão.");
    } finally {
      setIaLoading(false);
    }
  };

  const gerarLooksFallback = (todasPecas) => {
    const superiores = todasPecas.filter((p) => p.categoria === "superior");
    const inferiores = todasPecas.filter((p) => p.categoria === "inferior");
    const unicas = todasPecas.filter((p) => p.categoria === "unica");
    const sapatos = todasPecas.filter((p) => p.categoria === "sapato");
    const looks = [];
    for (
      let i = 0;
      i < 2 && superiores[i] && inferiores[i] && sapatos[i];
      i++
    ) {
      looks.push({
        pecas: [superiores[i], inferiores[i], sapatos[i]],
        explicacao: "Combinação prática sugerida automaticamente.",
      });
    }
    if (looks.length < 2) {
      for (
        let i = 0;
        i < 2 && looks.length < 2 && unicas[i] && sapatos[i];
        i++
      ) {
        looks.push({
          pecas: [unicas[i], sapatos[i]],
          explicacao: "Look com peça única sugerido automaticamente.",
        });
      }
    }
    return looks;
  };

  const handleSalvarLook = async (look) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Erro", "Você não está logado.");
      return;
    }
    try {
      const lookData = {
        pecas: look.pecas.map((p) => ({
          id: p.id,
          categoria: p.categoria,
          tipo: p.tipo || "",
          cor: p.cor || "",
          estilo: p.estilo || "",
          tecido: p.tecido || "",
          imageUrl: p.uri || p.imageUrl || "",
        })),
        ocasiao: ocasiao.trim(),
        cidade: cidade.trim(),
        createdAt: new Date(),
      };
      await salvarLook(uid, lookData);
      Alert.alert("Sucesso", "Look salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar look:", error);
      Alert.alert("Erro", "Não foi possível salvar o look.");
    }
  };

  // --------- FUNÇÕES - FIM ---------

  return (
    <View style={styles.container}>
      {/* Cabeçalho Personalizado */}
      <View style={styles.header}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.searchBarContainer}
            onPress={handleSugerirLook}
            activeOpacity={0.7}
          >
            <Text style={styles.searchPlaceholder}>Montar outfit...</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdicionarPeca}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() =>
              setModoVisualizacao(
                modoVisualizacao === "unico" ? "completo" : "unico"
              )
            }
          >
            <View style={styles.toggleIcon}>
              <View style={styles.toggleLine} />
              <View style={[styles.toggleLine, { marginTop: 2 }]} />
              {modoVisualizacao === "completo" && (
                <View style={[styles.toggleLine, { marginTop: 2 }]} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categorias de Peças */}
      <View style={styles.contentContainer}>
        {modoVisualizacao === "completo" ? (
          <>
            {/* Superiores */}
            {pecas.superior.length > 0 ? (
              <View style={styles.andarContainer}>
                <FlatList
                  data={Array(10)
                    .fill()
                    .flatMap(() => pecas.superior)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.pecaItemGrande}
                      onPress={() => handleExcluirPeca(item.id, "superior")}
                    >
                      <Image
                        source={{ uri: item.uri || item.imageUrl }}
                        style={styles.pecaImageGrande}
                      />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 20 }}
                  initialScrollIndex={Math.floor(
                    (pecas.superior.length * 10) / 2
                  )}
                  getItemLayout={(data, index) => ({
                    length: 240 + 32,
                    offset: (240 + 32) * index,
                    index,
                  })}
                />
              </View>
            ) : (
              <View style={styles.andarContainer}>
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>
                    Nenhum item superior adicionado.
                  </Text>
                </View>
              </View>
            )}
            {/* Inferiores */}
            {pecas.inferior.length > 0 ? (
              <View style={styles.andarContainer}>
                <FlatList
                  data={Array(10)
                    .fill()
                    .flatMap(() => pecas.inferior)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.pecaItemGrande}
                      onPress={() => handleExcluirPeca(item.id, "inferior")}
                    >
                      <Image
                        source={{ uri: item.uri || item.imageUrl }}
                        style={styles.pecaImageGrande}
                      />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 0 }}
                  initialScrollIndex={Math.floor(
                    (pecas.inferior.length * 10) / 2
                  )}
                  getItemLayout={(data, index) => ({
                    length: 240 + 32,
                    offset: (240 + 32) * index,
                    index,
                  })}
                />
              </View>
            ) : (
              <View style={styles.andarContainer}>
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>
                    Nenhum item inferior adicionado.
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Peças Únicas */}
            {pecas.unica.length > 0 ? (
              <View style={styles.andarContainer}>
                <FlatList
                  data={Array(10)
                    .fill()
                    .flatMap(() => pecas.unica)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.pecaItemUnicaGrande}
                      onPress={() => handleExcluirPeca(item.id, "unica")}
                    >
                      <Image
                        source={{ uri: item.uri || item.imageUrl }}
                        style={styles.pecaImageUnicaGrande}
                      />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 0 }}
                  initialScrollIndex={Math.floor((pecas.unica.length * 10) / 2)}
                  getItemLayout={(data, index) => ({
                    length: 300 + 32,
                    offset: (300 + 32) * index,
                    index,
                  })}
                />
              </View>
            ) : (
              <View style={styles.andarContainer}>
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>
                    Nenhuma peça "única" adicionada.
                  </Text>
                  <TouchableOpacity
                    onPress={handleAdicionarPeca}
                    style={styles.addButtonSmall}
                  >
                    <Text style={styles.addButtonTextSmall}>+ Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* Sapatos (sempre visível) */}
        {pecas.sapato.length > 0 ? (
          <View style={styles.andarContainer}>
            <FlatList
              data={Array(10)
                .fill()
                .flatMap(() => pecas.sapato)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pecaItemPequeno}
                  onPress={() => handleExcluirPeca(item.id, "sapato")}
                >
                  <Image
                    source={{ uri: item.uri || item.imageUrl }}
                    style={styles.pecaImagePequeno}
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 0 }}
              initialScrollIndex={Math.floor((pecas.sapato.length * 10) / 2)}
              getItemLayout={(data, index) => ({
                length: 140 + 24,
                offset: (140 + 24) * index,
                index,
              })}
            />
          </View>
        ) : (
          <View style={styles.andarContainer}>
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                Nenhum sapato adicionado.
              </Text>
              <TouchableOpacity
                onPress={handleAdicionarPeca}
                style={styles.addButtonSmall}
              >
                <Text style={styles.addButtonTextSmall}>+ Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Barra de Navegação Inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonActive]}
          onPress={() => navigation.navigate("GuardaRoupa")}
        >
          <Image
            source={require("../assets/cabide.png")}
            style={styles.navIcon1}
          />
          <Text style={styles.navButtonTextActive}>Guarda-roupa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Perfil")}
        >
          <Image
            source={require("../assets/perfil.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Modal: Adicionar Peça */}
      {modalVisible && (
        <View style={styles.overlayBottom} pointerEvents="box-none">
          <View
            style={styles.overlayTouchable}
            onTouchEnd={fecharModalAdicionarPeca}
          />
          <View style={styles.modalBottomSheet} pointerEvents="auto">
            <ScrollView
              contentContainerStyle={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>
                Selecione uma foto de sua peça de roupa:
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={() => selecionarImagem("galeria")}
                >
                  <Image
                    source={require("../assets/galeria.png")}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>GALERIA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => selecionarImagem("camera")}
                >
                  <Image
                    source={require("../assets/camera.png")}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>CÂMERA</Text>
                </TouchableOpacity>
              </View>
              {imagemUri && (
                <Image
                  source={{ uri: imagemUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.label}>Categoria:</Text>
              <View style={styles.tipoButtons}>
                {["superior", "inferior", "unica", "sapato"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTipo(t)}
                    style={[
                      styles.tipoButton,
                      tipo === t && styles.tipoButtonSelected,
                    ]}
                  >
                    <Text
                      style={
                        tipo === t ? styles.tipoTextSelected : styles.tipoText
                      }
                    >
                      {t === "unica" ? "única" : t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Tipo(ex: vestido, camisa)*"
                value={tipoEspecifico}
                onChangeText={setTipoEspecifico}
                placeholderTextColor="#ddd"
              />
              <TextInput
                style={styles.input}
                placeholder="Cor*"
                value={cor}
                onChangeText={setCor}
                placeholderTextColor="#ddd"
              />
              <TextInput
                style={styles.input}
                placeholder="Estilo(old school, gotico, esportivo)*"
                value={estilo}
                onChangeText={setEstilo}
                placeholderTextColor="#ddd"
              />
              <TextInput
                style={styles.input}
                placeholder="Tecido(opcional)"
                value={tecido}
                onChangeText={setTecido}
                placeholderTextColor="#ddd"
              />
              <Text style={styles.label}>Tem estampa?*</Text>
              <View style={styles.estampaButtons}>
                <TouchableOpacity
                  style={[
                    styles.estampaButton,
                    estampa === "sim" && styles.estampaButtonSelected,
                  ]}
                  onPress={() => setEstampa("sim")}
                >
                  <Text
                    style={[
                      styles.estampaButtonText,
                      estampa === "sim" && styles.estampaButtonTextSelected,
                    ]}
                  >
                    SIM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.estampaButton,
                    estampa === "nao" && styles.estampaButtonSelected,
                  ]}
                  onPress={() => {
                    setEstampa("nao");
                    setDescricaoEstampa("");
                  }}
                >
                  <Text
                    style={[
                      styles.estampaButtonText,
                      estampa === "nao" && styles.estampaButtonTextSelected,
                    ]}
                  >
                    NÃO
                  </Text>
                </TouchableOpacity>
              </View>
              {estampa === "sim" && (
                <TextInput
                  style={styles.input}
                  placeholder="Descreva a estampa (opcional)"
                  value={descricaoEstampa}
                  onChangeText={setDescricaoEstampa}
                  placeholderTextColor="#ddd"
                />
              )}
              <TouchableOpacity
                style={[
                  styles.enviarButton,
                  (loading || removingBg) && styles.enviarButtonDisabled,
                ]}
                onPress={salvarPecaLocal}
                disabled={loading || removingBg}
              >
                {loading || removingBg ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.enviarButtonText}>ENVIAR</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelarButton}
                onPress={fecharModalAdicionarPeca}
              >
                <Text style={styles.cancelarButtonText}>CANCELAR</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Modal: Sugerir Look */}
      {/* Modal: Sugerir Look */}
      <Modal
        visible={showSugestaoModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowSugestaoModal(false);
          setSugestaoEnviada(false);
        }}
      >
        <View style={styles.overlayCentral}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowSugestaoModal(false);
                setSugestaoEnviada(false);
              }}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            {!sugestaoEnviada ? (
              // Primeira tela: formulário
              <>
                <Text style={styles.sugestaoModalTitle}>Montar outfit</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ocasião</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Ex: casamento, date, trabalho"
                    value={ocasiao}
                    onChangeText={setOcasiao}
                    placeholderTextColor="#888"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Cidade</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Ex: São Paulo, Rio de Janeiro"
                    value={cidade}
                    onChangeText={setCidade}
                    placeholderTextColor="#888"
                  />
                  <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Digite o nome da cidade para ajustar à temperatura local
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.enviarButton}
                  onPress={handleGerarSugestao}
                  disabled={iaLoading}
                >
                  {iaLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.enviarButtonText}>Enviar</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              // Segunda tela: looks com navegação por setas (SEM comentários inválidos!)
              <>
                {/* Cabeçalho com clima */}
                <View style={styles.climaHeader}>
                  <Text style={styles.climaTexto}>
                    {`Clima em ${cidade}: ${ocasiao}`}
                  </Text>
                </View>

                {/* Container com setas e look central */}
                <View style={styles.lookNavigatorContainer}>
                  {/* Seta Esquerda */}
                  {sugestoes.length > 1 && lookAtualIndex > 0 ? (
                    <TouchableOpacity
                      style={styles.seta}
                      onPress={() => setLookAtualIndex(lookAtualIndex - 1)}
                    >
                      <Text style={styles.setaTexto}>{"\u25C0"}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.seta, { opacity: 0 }]}>
                      <Text style={styles.setaTexto}>{"\u25C0"}</Text>
                    </View>
                  )}

                  {/* Look atual */}
                  <View style={styles.lookCard}>
                    <View style={styles.lookPecasContainer}>
                      {sugestoes[lookAtualIndex]?.pecas.map((peca, i) => {
                        const imgUri = peca.uri || peca.imageUrl;
                        return (
                          <View key={i} style={styles.pecaWrapper}>
                            {imgUri ? (
                              <Image
                                source={{ uri: imgUri }}
                                style={styles.lookPecaImagemGrande}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={styles.placeholderPeca}>
                                <Text style={styles.placeholderTexto}>
                                  {peca.tipo?.slice(0, 8) || "Peça"}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                    <TouchableOpacity
                      style={styles.botaoSalvarLook}
                      onPress={() =>
                        handleSalvarLook(sugestoes[lookAtualIndex])
                      }
                    >
                      <Image
                        source={require("../assets/salvar.png")}
                        style={styles.iconeSalvar}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Seta Direita */}
                  {sugestoes.length > 1 &&
                  lookAtualIndex < sugestoes.length - 1 ? (
                    <TouchableOpacity
                      style={styles.seta}
                      onPress={() => setLookAtualIndex(lookAtualIndex + 1)}
                    >
                      <Text style={styles.setaTexto}>{"\u25B6"}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.seta, { opacity: 0 }]}>
                      <Text style={styles.setaTexto}>{"\u25B6"}</Text>
                    </View>
                  )}
                </View>

                {/* Indicador de página */}
                {sugestoes.length > 1 && (
                  <View style={styles.indicadorContainer}>
                    {sugestoes.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.indicador,
                          {
                            backgroundColor:
                              i === lookAtualIndex ? "#000" : "#ccc",
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal: Confirmação de Exclusão */}
      <Modal
        visible={showConfirmModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.overlayCentral}>
          <View style={styles.confirmModalBox}>
            <Text style={styles.confirmModalTitle}>
              Tem certeza que deseja apagar esse item?
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={async () => {
                if (!pecaToDelete) return;
                try {
                  await excluirPeca(pecaToDelete.id);
                  setPecas((prev) => ({
                    ...prev,
                    [pecaToDelete.categoria]: prev[
                      pecaToDelete.categoria
                    ].filter((peca) => peca.id !== pecaToDelete.id),
                  }));
                  Alert.alert("Sucesso", "Peça removida!");
                } catch (error) {
                  console.error("Erro ao excluir:", error);
                  Alert.alert("Erro", "Não foi possível excluir.");
                } finally {
                  setShowConfirmModal(false);
                  setPecaToDelete(null);
                }
              }}
            >
              <Text style={styles.confirmButtonText}>Sim</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                setShowConfirmModal(false);
                setPecaToDelete(null);
              }}
            >
              <Text style={styles.confirmButtonText}>Não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 80,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 15,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#A89CF2",
    fontSize: 24,
    fontWeight: "bold",
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
  andarContainer: {
    marginBottom: -50,
  },
  pecaItemGrande: {
    alignItems: "center",
    width: 200,
    height: 260,
  },
  pecaImageGrande: {
    width: 160,
    height: 240,
    resizeMode: "contain",
    borderRadius: 10,
  },
  pecaItemUnicaGrande: {
    alignItems: "center",
    width: 320,
    height: 400,
    marginRight: -80,
  },
  pecaImageUnicaGrande: {
    width: 260,
    height: 340,
    resizeMode: "contain",
    borderRadius: 10,
  },
  pecaItemPequeno: {
    alignItems: "center",
    marginRight: 24,
    width: 140,
    height: 160,
  },
  pecaImagePequeno: {
    width: 120,
    height: 140,
    resizeMode: "contain",
    borderRadius: 8,
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    minWidth: 200,
  },
  placeholderText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 8,
  },
  addButtonSmall: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addButtonTextSmall: {
    color: "#A89CF2",
    fontSize: 14,
    fontWeight: "600",
  },
  toggleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleIcon: {
    width: 20,
    height: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLine: {
    width: 16,
    height: 2,
    backgroundColor: "#A89CF2",
    borderRadius: 1,
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    borderRadius: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 60,
    marginLeft: 70,
    width: "58%",
    height: 65,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  navButtonActive: {
    backgroundColor: "#A89CF2",
    width: 160,
    height: 48,
    borderRadius: 55,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    marginLeft: -5,
  },
  navIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  navIcon1: {
    width: 25,
    height: 17,
    marginRight: 5,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  navButtonTextActive: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  overlayCentral: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayBottom: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  modalBottomSheet: {
    backgroundColor: "#000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 24,
    maxHeight: "80%",
    marginTop: 60,
  },
  modalScrollView: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  galleryButton: {
    flex: 1,
    backgroundColor: "#A89CF2",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 5,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: "#A89CF2",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginLeft: 5,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  previewImage: {
    width: "100%",
    height: 150,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#fff",
  },
  tipoButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  tipoButton: {
    backgroundColor: "#444",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#666",
  },
  tipoButtonSelected: {
    backgroundColor: "#A89CF2",
    borderColor: "#A89CF2",
  },
  tipoText: {
    color: "#fff",
    fontSize: 14,
  },
  tipoTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  estampaButtons: {
    flexDirection: "row",
    marginBottom: 15,
  },
  estampaButton: {
    flex: 1,
    backgroundColor: "#444",
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  estampaButtonSelected: {
    backgroundColor: "#A89CF2",
  },
  estampaButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  estampaButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  enviarButton: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  enviarButtonDisabled: {
    backgroundColor: "#ccc",
  },
  enviarButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },
  cancelarButton: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  cancelarButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalBox: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#A89CF2",
    borderRadius: 20,
    padding: 25,
    position: "relative",
    maxHeight: "90%",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  sugestaoModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#000",
  },
  inputField: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  // --- Cabeçalho do clima ---
  climaHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  climaTexto: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  // --- Navegação por setas ---
  lookNavigatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  seta: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginlef: -10,
  },
  setaTexto: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#000",
  },
  // --- Look card ---
  lookCard: {
    width: 220,
    height: 480,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lookPecasContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    flex: 1,
  },
  pecaWrapper: {
    marginBottom: 16,
  },
  lookPecaImagemGrande: {
    width: 160,
    height: 180,
    borderRadius: 8,
  },
  placeholderPeca: {
    width: 160,
    height: 180,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderTexto: {
    fontSize: 10,
    color: "#777",
  },
  // --- Botão de salvar como ícone ---
  botaoSalvarLook: {
    position: "absolute",
    bottom: -25,
    right: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  iconeSalvar: {
    width: 28,
    height: 28,
  },
  // --- Indicador de página (bolinhas) ---
  indicadorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  indicador: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
});
