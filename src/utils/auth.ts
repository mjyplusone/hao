import Taro from "@tarojs/taro";

// 检查是否已登录
export const checkLoginStatus = (): boolean => {
  const isLoggedIn = Taro.getStorageSync("isLoggedIn");
  return !!isLoggedIn;
};

// 获取用户信息
export const getUserInfo = () => {
  return Taro.getStorageSync("userInfo") || null;
};

// 获取session key
export const getSessionKey = () => {
  return Taro.getStorageSync("sessionKey") || null;
};

// 清除登录状态
export const clearLoginStatus = () => {
  Taro.removeStorageSync("isLoggedIn");
  Taro.removeStorageSync("userInfo");
  Taro.removeStorageSync("sessionKey");
};

// 跳转到登录页面
export const goToLogin = () => {
  Taro.reLaunch({
    url: "/pages/login/index",
  });
};

// 跳转到首页
export const goToHome = () => {
  Taro.switchTab({
    url: "/pages/index/index",
  });
};
