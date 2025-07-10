import { supabase } from "@/supabase/supabase";
import { login } from "@react-native-kakao/user";
import { User } from "@supabase/supabase-js";
import * as AppleAuthentication from "expo-apple-authentication";

interface KakaoLoginToken {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
}

interface VetSignUpParams {
  email: string;
  password: string;
  username: string;
  full_name: string;
  hospital_id: string;
  license_number: string;
}

export async function signInWithKakao(): Promise<void> {
  try {
    const kakaoResponse: KakaoLoginToken = await login({
      useKakaoAccountLogin: true,
      scopes: ["openid", "profile_nickname", "profile_image", "account_email"],
    });
    const { accessToken, idToken } = kakaoResponse;
    console.log("Kakao login response:", { accessToken, idToken });

    if (!idToken)
      throw new Error("카카오 idToken이 반환되지 않았습니다. Kakao Developer에서 OpenID Connect 설정을 확인하세요.");

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "kakao",
      token: idToken,
    });

    if (error) {
      console.error("Supabase signInWithIdToken error:", error.message);
      throw new Error(
        `카카오 로그인 실패: ${error.message}. Supabase Kakao Client ID가 네이티브 앱 키(8127f697abae9a812bf8ed378133d7c6)인지 확인하세요.`
      );
    }

    console.log("Supabase response:", { user: data.user, session: data.session });

    const user: User | null = data.user;
    if (!user) throw new Error("사용자 정보 없음");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile && !profileError) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        username: user.email || `kakao_${user.id.slice(0, 8)}`,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });
      if (insertError) throw new Error(`프로필 생성 실패: ${insertError.message}`);
    }
  } catch (error) {
    console.error("카카오 로그인 전체 에러:", (error as Error).message);
    throw new Error(`카카오 로그인 에러: ${(error as Error).message}`);
  }
}

export async function signInWithApple(): Promise<void> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    console.log("Apple login response:", credential);

    if (!credential.identityToken) throw new Error("Apple identityToken이 반환되지 않았습니다.");

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });

    if (error) {
      console.error("Supabase signInWithIdToken error:", error.message);
      throw new Error(`Apple 로그인 실패: ${error.message}. Supabase Apple provider 설정을 확인하세요.`);
    }

    console.log("Supabase response:", { user: data.user, session: data.session });

    const user: User | null = data.user;
    if (!user) throw new Error("사용자 정보 없음");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile && !profileError) {
      const fullName = credential.fullName
        ? `${credential.fullName.givenName || ""} ${credential.fullName.familyName || ""}`.trim()
        : null;
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        username: user.email || `apple_${user.id.slice(0, 8)}`,
        full_name: fullName || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });
      if (insertError) throw new Error(`프로필 생성 실패: ${insertError.message}`);
    }
  } catch (error) {
    console.error("Apple 로그인 전체 에러:", (error as Error).message);
    if ((error as any).code === "ERR_REQUEST_CANCELED") {
      throw new Error("Apple 로그인 취소");
    }
    throw new Error(`Apple 로그인 에러: ${(error as Error).message}`);
  }
}

export async function signUpVet({
  email,
  password,
  username,
  full_name,
  hospital_id,
  license_number,
}: VetSignUpParams): Promise<void> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw new Error(`회원가입 실패: ${authError.message}`);

  const user: User | null = authData.user;
  if (!user) throw new Error("사용자 정보 없음");

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    full_name,
    avatar_url: null,
  });
  if (profileError) throw new Error(`프로필 생성 실패: ${profileError.message}`);

  const { error: vetError } = await supabase.from("vets").insert({
    user_id: user.id,
    full_name,
    hospital_id,
    license_number,
  });
  if (vetError) throw new Error(`수의사 등록 실패: ${vetError.message}`);
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase signOut error:", error.message);
      throw new Error(`로그아웃 실패: ${error.message}`);
    }
    console.log("로그아웃 성공");
  } catch (error) {
    console.error("로그아웃 전체 에러:", (error as Error).message);
    throw new Error(`로그아웃 에러: ${(error as Error).message}`);
  }
}
