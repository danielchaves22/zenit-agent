import { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { BackendClient } from "@myagent/sdk-client";

const backendUrl = (Constants.expoConfig?.extra?.backendUrl as string | undefined) ?? "http://localhost:3000";
const defaultUserId = (Constants.expoConfig?.extra?.userId as string | undefined) ?? "demo-user";

export default function App() {
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [answer, setAnswer] = useState<string>("Ainda sem resposta.");
  const [isLoading, setIsLoading] = useState(false);

  const client = useMemo(
    () =>
      new BackendClient({
        baseUrl: backendUrl,
        userId: defaultUserId,
        fetcher: (url, init) => fetch(url, init)
      }),
    []
  );

  const handleSend = async () => {
    if (!message.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await client.sendChat({
        threadId,
        message
      });
      setThreadId(response.threadId);
      setAnswer(response.answer);
      setMessage("");
    } catch (error) {
      setAnswer(`Erro ao chamar backend: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>MyAgent</Text>
      <Text style={styles.subtitle}>Backend: {backendUrl}</Text>
      <Text style={styles.subtitle}>Thread: {threadId ?? "nova"}</Text>

      <View style={styles.card}>
        <Text style={styles.answerLabel}>Resposta</Text>
        <Text style={styles.answer}>{answer}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Digite uma mensagem"
        value={message}
        onChangeText={setMessage}
        editable={!isLoading}
      />

      <TouchableOpacity style={[styles.button, isLoading ? styles.buttonDisabled : null]} onPress={handleSend} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? "Enviando..." : "Enviar"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F5F8",
    padding: 20,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1B2A41"
  },
  subtitle: {
    fontSize: 12,
    color: "#4A5A70"
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D7DEEA",
    minHeight: 120
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2D3E59",
    marginBottom: 8
  },
  answer: {
    fontSize: 16,
    color: "#223049"
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C8D0DD",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  button: {
    backgroundColor: "#0F62FE",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});
