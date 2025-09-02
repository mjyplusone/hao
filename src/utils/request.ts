import Taro from "@tarojs/taro";
import { BaseResponse } from "@/types";

// 请求配置
const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api"
    : "https://your-api-domain.com/api";

// 请求超时时间
const TIMEOUT = 10000;

// 请求拦截器
const requestInterceptor = (config: any) => {
  // 添加 token
  const token = Taro.getStorageSync("accessToken");
  if (token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${token}`,
    };
  }

  // 添加基础 URL
  if (!config.url.startsWith("http")) {
    config.url = `${BASE_URL}${config.url}`;
  }

  return config;
};

// 响应拦截器
const responseInterceptor = (response: any) => {
  const { statusCode, data } = response;

  if (statusCode >= 200 && statusCode < 300) {
    return data;
  }

  // 处理错误
  const error = new Error(data?.message || "请求失败");
  error.name = "RequestError";
  throw error;
};

// 统一请求方法
export const request = async <T = any>(
  options: Taro.request.Option
): Promise<BaseResponse<T>> => {
  try {
    // 请求拦截
    const config = requestInterceptor(options);

    // 发起请求
    const response = await Taro.request({
      timeout: TIMEOUT,
      ...config,
    });

    // 响应拦截
    return responseInterceptor(response);
  } catch (error) {
    console.error("请求错误:", error);
    throw error;
  }
};

export const get = <T = any>(
  url: string,
  data?: any
): Promise<BaseResponse<T>> => {
  return request({
    url,
    method: "GET",
    data,
  });
};

export const post = <T = any>(
  url: string,
  data?: any
): Promise<BaseResponse<T>> => {
  return request({
    url,
    method: "POST",
    data,
  });
};

export const put = <T = any>(
  url: string,
  data?: any
): Promise<BaseResponse<T>> => {
  return request({
    url,
    method: "PUT",
    data,
  });
};

export const del = <T = any>(
  url: string,
  data?: any
): Promise<BaseResponse<T>> => {
  return request({
    url,
    method: "DELETE",
    data,
  });
};
