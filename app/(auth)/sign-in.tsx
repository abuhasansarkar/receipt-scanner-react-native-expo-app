import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { isClerkAPIResponseError } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { AuthService } from "@/features/auth/service";
import { isClerkConfigured } from "@/lib/clerk";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: "oauth_apple" });

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!email.trim() || pending) return;
    setPending(true);
    setError(null);
    try {
      if (isClerkConfigured && signIn) {
        const result = await signIn.create({ identifier: email.trim() });
        if (result.status === "needs_first_factor") {
          const emailCodeFactor = result.supportedFirstFactors?.find(
            (f) => f.strategy === "email_code"
          );
          if (emailCodeFactor && "emailAddressId" in emailCodeFactor) {
            await signIn.prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: emailCodeFactor.emailAddressId,
            });
            setShowCodeInput(true);
          }
        } else if (result.status === "complete") {
          await setActive?.({ session: result.createdSessionId });
          router.replace("/(tabs)");
        }
      } else {
        AuthService.signIn(email.trim(), email.trim());
        router.replace("/(tabs)");
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setPending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || pending) return;
    setPending(true);
    setError(null);
    try {
      if (signIn && isClerkConfigured) {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: code.trim(),
        });
        if (result.status === "complete") {
          await setActive?.({ session: result.createdSessionId });
          router.replace("/(tabs)");
        } else if (result.createdSessionId) {
          await setActive?.({ session: result.createdSessionId });
          router.replace("/(tabs)");
        } else {
          setError("Verification failed. Please try again.");
        }
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Invalid code");
      } else {
        setError("Invalid code");
      }
    } finally {
      setPending(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    setSocialPending(provider);
    setError(null);
    try {
      const startOAuth = provider === "google" ? startGoogleOAuth : startAppleOAuth;
      if (!startOAuth) return;
      const { createdSessionId, setActive: oauthSetActive } = await startOAuth();
      if (createdSessionId) {
        await oauthSetActive?.({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Social sign in failed");
      } else {
        setError("Social sign in failed");
      }
    } finally {
      setSocialPending(null);
    }
  };

  const busy = pending || !isLoaded;

  if (showCodeInput) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View nativeID="clerk-captcha" className="absolute h-0 w-0" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <View className="flex-1 justify-center px-8">
            <View className="mb-8 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15">
                <Ionicons name="mail-outline" size={32} color="#22c55e" />
              </View>
              <Text className="text-2xl font-bold text-white">Check your email</Text>
              <Text className="mt-1 text-center text-sm text-zinc-500">
                We sent a verification code to{"\n"}{email}
              </Text>
            </View>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Enter verification code"
              placeholderTextColor="#71717a"
              keyboardType="number-pad"
              className="mb-6 rounded-xl border border-surface-border bg-surface-raised px-4 py-3.5 text-center text-2xl tracking-widest text-white"
              maxLength={6}
            />
            {error && (
              <Text className="-mt-4 mb-4 text-center text-xs text-red-400">{error}</Text>
            )}
            <Button label="Verify" onPress={handleVerifyCode} disabled={code.trim().length < 4 || busy} loading={busy} />
            <Pressable onPress={() => { setShowCodeInput(false); setCode(""); setError(null); }} className="mt-4 items-center">
              <Text className="text-sm text-zinc-500">Use a different email</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View nativeID="clerk-captcha" className="absolute h-0 w-0" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-1 justify-center px-8">
          <View className="mb-8 items-center">
<View className="mb-4 items-center justify-center rounded-2xl">

  <Image source={require("@/assets/images/receipt.png")} className="h-60 w-60" />
</View>
            <Text className="text-2xl font-bold text-white">Welcome back</Text>
            <Text className="mt-1 text-sm text-zinc-500">Sign in to your account</Text>
          </View>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#71717a"
            className="mb-4 rounded-xl border border-surface-border bg-surface-raised px-4 py-3.5 text-white"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {error && (
            <Text className="-mt-3 mb-4 text-xs text-red-400">{error}</Text>
          )}

          <Button className="text-white" label="Send verification code" onPress={handleSendCode} disabled={!email.trim() || busy} loading={busy} />

          {isClerkConfigured && (
            <>
              <View className="my-6 flex-row items-center gap-3">
                <View className="flex-1 h-px bg-surface-border" />
                <Text className="text-xs text-zinc-500">Or continue with</Text>
                <View className="flex-1 h-px bg-surface-border" />
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => handleSocialSignIn("google")}
                  disabled={socialPending !== null}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-raised px-4 py-3.5 active:opacity-70"
                >
                  {socialPending === "google" ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={18} color="#ffffff" />
                      <Text className="text-sm font-medium text-white">Google</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => handleSocialSignIn("apple")}
                  disabled={socialPending !== null}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-raised px-4 py-3.5 active:opacity-70"
                >
                  {socialPending === "apple" ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="logo-apple" size={18} color="#ffffff" />
                      <Text className="text-sm font-medium text-white">Apple</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </>
          )}

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-sm text-zinc-500">No account?</Text>
            <Pressable onPress={() => router.push("/(auth)/sign-up" as Href)}>
              <Text className="text-sm font-semibold text-brand-500">Sign up</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => router.replace("/(tabs)")} className="mt-4 items-center">
            <Text className="text-sm text-zinc-500">Continue offline</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
