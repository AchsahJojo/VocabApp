import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function OAuth2Login() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Google OAuth (ID token) — must match backend audience
  const WEB_CLIENT_ID = process.env.PUBLIC_EXPO_GOOGLE_OAUTH_CLIENT_ID;
  const API_BASE = "http://localhost:8080"; // your backend base URL

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID,
  });

  useEffect(() => {
    const finishLogin = async () => {
      if (response?.type !== "success") return;
      const idToken = (response.params as any)?.id_token;
      if (!idToken) return;
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Login failed");
        setUserId(String(data.userId));
      } catch (e: any) {
        console.warn("Backend login error:", e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    finishLogin();
  }, [response]);

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator /> : null}
      {userId ? (
        <View style={styles.userInfo}>
          <Text style={styles.title}>Signed in</Text>
          <Text style={styles.text}>userId: {userId}</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Sign in with Google</Text>
          <Button
            disabled={!request || loading}
            title="Sign in with Google"
            onPress={() => {
              promptAsync();
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  userInfo: { alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  text: { fontSize: 16, marginBottom: 8 },
});
