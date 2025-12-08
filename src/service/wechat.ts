import { post, get, put } from "../utils/request";
import { LoginData } from "@/types/user";

export const login = async (code: string): Promise<LoginData> => {
  const response = await post<LoginData>("/auth/wechat/login", { code });
  return response;
};

export const getWechatUserInfo = async (): Promise<any> => {
  const response = await get("/user/info");
  return response;
};

export const updateWechatUserInfo = async (userInfo: any): Promise<any> => {
  const response = await put("/userinfo", userInfo);
  return response;
};
