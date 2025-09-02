import Taro from "@tarojs/taro";
import { login } from "@/service/wechat";
import { UserInfo } from "@/types/user";

interface WechatLoginResult {
  code: string;
  errMsg?: string;
}

interface WechatUserInfo {
  nickName: string;
  avatarUrl: string;
  gender?: number;
  country: string;
  province: string;
  city: string;
}

/**
 * 获取微信用户信息
 * 使用微信小程序推荐的button组件方式获取用户信息
 */
export const getWechatUserProfile = async (): Promise<WechatUserInfo> => {
  try {
    // 使用微信小程序推荐的 getUserProfile API
    const profileResult = await Taro.getUserProfile({
      desc: "用于完善用户资料",
      lang: "zh_CN",
    });

    return {
      nickName: profileResult.userInfo.nickName || "微信用户",
      avatarUrl: profileResult.userInfo.avatarUrl || "",
      gender: profileResult.userInfo.gender || 0,
      country: profileResult.userInfo.country || "",
      province: profileResult.userInfo.province || "",
      city: profileResult.userInfo.city || "",
    };
  } catch (error) {
    console.warn("获取用户信息失败:", error);
    throw error; // 重新抛出错误，让调用方处理
  }
};

/**
 * 微信登录（不包含用户信息获取）
 */
export const wechatLoginWithoutProfile = async (): Promise<UserInfo> => {
  try {
    // 1. 调用 Taro.login 获取 code
    const loginResult: WechatLoginResult = await Taro.login();

    if (!loginResult.code) {
      throw new Error("获取登录凭证失败");
    }

    // 2. 调用后端接口，只传递 code
    const loginData = await login(loginResult.code);

    // 3. 保存登录信息到本地存储
    Taro.setStorageSync("isLoggedIn", true);
    Taro.setStorageSync("sessionKey", loginData.session_key);
    Taro.setStorageSync("openid", loginData.openid);
    if (loginData.unionid) {
      Taro.setStorageSync("unionid", loginData.unionid);
    }
    if (loginData.access_token) {
      Taro.setStorageSync("accessToken", loginData.access_token);
    }

    // 4. 返回用户信息
    const userInfo: UserInfo = {
      id: loginData.openid, // 使用 openid 作为临时 id
      openid: loginData.openid,
      nickName: "微信用户",
      avatarUrl: "",
      gender: 0,
      country: "",
      province: "",
      city: "",
      unionid: loginData.unionid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Taro.setStorageSync("userInfo", userInfo);

    return userInfo;
  } catch (error) {
    console.error("微信登录失败:", error);
    throw error;
  }
};

/**
 * 微信登录（包含用户信息获取）
 * 接收从button组件获取的用户信息
 */
export const wechatLogin = async (
  userProfile?: WechatUserInfo
): Promise<UserInfo> => {
  try {
    // 1. 如果没有传入用户信息，尝试获取
    let finalUserProfile: WechatUserInfo;
    if (userProfile) {
      finalUserProfile = userProfile;
    } else {
      finalUserProfile = await getWechatUserProfile();
    }

    // 2. 调用 Taro.login 获取 code
    const loginResult: WechatLoginResult = await Taro.login();

    if (!loginResult.code) {
      throw new Error("获取登录凭证失败");
    }

    // 3. 调用后端接口，传递 code 和用户信息
    const loginData = await login(loginResult.code, finalUserProfile);

    // 4. 保存登录信息到本地存储
    Taro.setStorageSync("isLoggedIn", true);
    Taro.setStorageSync("sessionKey", loginData.session_key);
    Taro.setStorageSync("openid", loginData.openid);
    if (loginData.unionid) {
      Taro.setStorageSync("unionid", loginData.unionid);
    }
    if (loginData.access_token) {
      Taro.setStorageSync("accessToken", loginData.access_token);
    }

    // 5. 返回用户信息
    const userInfo: UserInfo = {
      id: loginData.openid, // 使用 openid 作为临时 id
      openid: loginData.openid,
      nickName: finalUserProfile.nickName,
      avatarUrl: finalUserProfile.avatarUrl,
      gender: finalUserProfile.gender || 0,
      country: finalUserProfile.country,
      province: finalUserProfile.province,
      city: finalUserProfile.city,
      unionid: loginData.unionid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Taro.setStorageSync("userInfo", userInfo);

    return userInfo;
  } catch (error) {
    console.error("微信登录失败:", error);
    throw error;
  }
};

/**
 * 检查登录状态
 * @returns boolean
 */
export const checkWechatLoginStatus = (): boolean => {
  const isLoggedIn = Taro.getStorageSync("isLoggedIn");
  const sessionKey = Taro.getStorageSync("sessionKey");
  const openid = Taro.getStorageSync("openid");

  return !!(isLoggedIn && sessionKey && openid);
};

/**
 * 获取用户信息
 * @returns UserInfo | null
 */
export const getWechatUserInfo = (): UserInfo | null => {
  return Taro.getStorageSync("userInfo") || null;
};

/**
 * 获取 openid
 * @returns string | null
 */
export const getOpenid = (): string | null => {
  return Taro.getStorageSync("openid") || null;
};

/**
 * 获取 session key
 * @returns string | null
 */
export const getSessionKey = (): string | null => {
  return Taro.getStorageSync("sessionKey") || null;
};

/**
 * 获取 access token
 * @returns string | null
 */
export const getAccessToken = (): string | null => {
  return Taro.getStorageSync("accessToken") || null;
};

/**
 * 清除微信登录信息
 */
export const clearWechatLogin = () => {
  Taro.removeStorageSync("isLoggedIn");
  Taro.removeStorageSync("sessionKey");
  Taro.removeStorageSync("openid");
  Taro.removeStorageSync("unionid");
  Taro.removeStorageSync("accessToken");
  Taro.removeStorageSync("userInfo");
};
