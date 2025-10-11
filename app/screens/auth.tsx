// ...existing code...
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
import * as SecureStore from "expo-secure-store";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function OAuth2Login() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // REPLACE these with the client IDs you created in Google Cloud:
  // - WEB_CLIENT_ID: use for Expo Go / useProxy (Web application client ID)
  // - IOS_CLIENT_ID: use for standalone iOS build (iOS client ID)
  const WEB_CLIENT_ID = "<WEB_CLIENT_ID.apps.googleusercontent.com>";
  const IOS_CLIENT_ID = "<IOS_CLIENT_ID.apps.googleusercontent.com>";

  // Create the request (PKCE is handled for you)
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID, // for Expo Go / proxy
    iosClientId: IOS_CLIENT_ID, // for standalone iOS
    scopes: ["openid", "profile", "email"],
    // redirectUri will be generated automatically. For Expo Go useProxy:true when calling promptAsync.
  });

  useEffect(() => {
    if (response?.type === "success" && response.authentication) {
      const accessToken = response.authentication.accessToken;
      handleSignIn(accessToken);
    }
  }, [response]);

  const handleSignIn = async (accessToken: string | undefined) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      await SecureStore.setItemAsync("access_token", accessToken);
      // get profile
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await res.json();
      setUser(profile);
    } catch (err) {
      console.error("profile fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    setUser(null);
  };

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator /> : null}
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.text}>Name: {user.name}</Text>
          <Text style={styles.text}>Email: {user.email}</Text>
          <Button title="Logout" onPress={logout} />
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Sign in with Google</Text>
          <Button
            disabled={!request || loading}
            title="Sign in"
            onPress={() => {
              // For development with Expo Go, just call promptAsync().
              promptAsync();
              // For standalone builds, you can also just call promptAsync().
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
