import { useOAuth, useSignUp } from "@clerk/clerk-expo";
import { isClerkAPIResponseError } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { AuthService } from "@/features/auth/service";
import { isClerkConfigured } from "@/lib/clerk";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: "oauth_apple" });

  const [name, setName] = useState("");
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
      if (isClerkConfigured && signUp) {
        await signUp.create({ emailAddress: email.trim() });
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setShowCodeInput(true);
      } else {
        AuthService.signIn(name.trim() || email.trim(), email.trim());
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
      if (signUp && isClerkConfigured) {
        await signUp.attemptEmailAddressVerification({ code: code.trim() });

        const trySetSession = async (sid: string | null | undefined) => {
          if (!sid) return false;
          await setActive?.({ session: sid });
          router.replace("/(tabs)");
          return true;
        };

        if (await trySetSession(signUp.createdSessionId)) return;

        const emailStatus = signUp.verifications?.emailAddress?.status;
        const signUpStatus = signUp.status;

        if (emailStatus === "verified" || signUpStatus === "complete") {
          if (await trySetSession(signUp.createdSessionId)) return;
        }

        if (emailStatus === "verified" || signUpStatus === "missing_requirements" || signUpStatus === null) {
          const displayName = name.trim() || email.trim().split("@")[0] || "User";
          const [firstName = "", ...lastNameParts] = displayName.split(" ");
          await signUp.update({
            firstName,
            lastName: lastNameParts.join(" ") || undefined,
          });

          if (await trySetSession(signUp.createdSessionId)) return;

          if (signUp.createdUserId) {
            const future = (signUp as any).__internal_future;
            if (future?.finalize) {
              const { error: finalErr } = await future.finalize();
              if (!finalErr) {
                if (await trySetSession(future.createdSessionId || signUp.createdSessionId)) return;
                router.replace("/(tabs)");
                return;
              }
            }
          }
        }

        setError("Unable to complete sign-up. Please try again.");
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

  const handleResendCode = async () => {
    if (!signUp || pending) return;
    setPending(true);
    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message ?? "Failed to resend code");
      } else {
        setError("Failed to resend code");
      }
    } finally {
      setPending(false);
    }
  };

  const handleSocialSignUp = async (provider: "google" | "apple") => {
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
        setError(err.errors[0]?.message ?? "Social sign up failed");
      } else {
        setError("Social sign up failed");
      }
    } finally {
      setSocialPending(null);
    }
  };

  const busy = pending || !isLoaded;

  if (showCodeInput) {
    return (
      <SafeAreaView className="flex-1 bg-surface-base">
        <View nativeID="clerk-captcha" className="absolute h-0 w-0" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <View className="flex-1 justify-center px-8">
            <View className="mb-8 items-center">
              <View className="mb-4 w-16 h-16 items-center justify-center rounded-2xl bg-brand/15">
                <Ionicons name="mail-outline" size={32} color="#4be277" />
              </View>
              <Text className="text-2xl font-bold text-surface-text">Verify your email</Text>
              <Text className="mt-1 text-center text-sm text-muted">
                We sent a verification code to{"\n"}{email}
              </Text>
            </View>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Verification code"
              placeholderTextColor="#5a6d5a"
              keyboardType="number-pad"
              className="mb-6 rounded-xl border border-surface-border bg-surface-container px-4 py-3.5 text-center text-2xl tracking-widest text-surface-text"
              maxLength={6}
            />
            {error && (
              <Text className="-mt-4 mb-4 text-center text-xs text-red-400">{error}</Text>
            )}
            <Button label="Create account" onPress={handleVerifyCode} disabled={code.trim().length < 4 || busy} loading={busy} />
            <Pressable onPress={handleResendCode} className="mt-4 items-center">
              <Text className="text-sm text-muted">Resend code</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <View nativeID="clerk-captcha" className="absolute h-0 w-0" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-1 justify-center px-8">
          <View className="mb-8 items-center">
            <View className="mb-4 items-center justify-center rounded-2xl">
              <Image source={require("@/assets/images/receipt.png")} className="h-60 w-60" />
            </View>
            <Text className="text-2xl font-bold text-surface-text">Create account</Text>
            <Text className="mt-1 text-sm text-muted">Start tracking your expenses</Text>
          </View>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name (optional)"
            placeholderTextColor="#5a6d5a"
            className="mb-4 rounded-xl border border-surface-border bg-surface-container px-4 py-3.5 text-surface-text"
            autoCapitalize="words"
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#5a6d5a"
            className="mb-4 rounded-xl border border-surface-border bg-surface-container px-4 py-3.5 text-surface-text"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {error && (
            <Text className="-mt-3 mb-4 text-xs text-red-400">{error}</Text>
          )}

          <Button label="Send verification code" onPress={handleSendCode} disabled={!email.trim() || busy} loading={busy} />

          {isClerkConfigured && (
            <>
              <View className="my-6 flex-row items-center gap-3">
                <View className="flex-1 h-px bg-surface-border" />
                <Text className="text-xs text-muted">Or continue with</Text>
                <View className="flex-1 h-px bg-surface-border" />
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => handleSocialSignUp("google")}
                  disabled={socialPending !== null}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-container px-4 py-3.5 active:opacity-70"
                >
                  {socialPending === "google" ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={18} color="#dce5d9" />
                      <Text className="text-sm font-medium text-surface-text">Google</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => handleSocialSignUp("apple")}
                  disabled={socialPending !== null}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-container px-4 py-3.5 active:opacity-70"
                >
                  {socialPending === "apple" ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="logo-apple" size={18} color="#dce5d9" />
                      <Text className="text-sm font-medium text-surface-text">Apple</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </>
          )}

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-sm text-muted">Already have an account?</Text>
            <Pressable onPress={() => router.push("/(auth)/sign-in" as Href)}>
              <Text className="text-sm font-semibold text-brand">Sign in</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
