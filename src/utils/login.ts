import Taro from "@tarojs/taro";
import { getWechatUserInfo, login } from "@/service/wechat";
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
    const loginData = await login(loginResult.code);

    // 4. 保存登录信息到本地存储
    Taro.setStorageSync("isLoggedIn", true);
    if (loginData.token) {
      Taro.setStorageSync("accessToken", loginData.token);
    }

    const userInfo = await getWechatUserInfo();

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
