import { post, get, put } from "../utils/request";
import { LoginData } from "@/types/user";

export const login = async (
  code: string,
  userInfo?: any
): Promise<LoginData> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    openid: "111111",
    session_key: "aaaaaa",
    unionid: "111111",
    access_token: "hhhhhh",
    expires_in: 1000,
    userInfo: {
      id: "222222",
      openid: "222222",
      nickName: "jiayi",
      avatarUrl: "https://img.yzcdn.cn/vant/cat.jpeg",
      gender: 1,
      country: "China",
      province: "Shanghai",
      city: "Shanghai",
      unionid: "111111",
      createdAt: "2025-08-28",
      updatedAt: "2025-08-28",
    },
  };
  // const response = await post<LoginData>("/login", { code });
  // return response.data;
};

export const getWechatUserInfo = async (): Promise<any> => {
  const response = await get("/userinfo");
  return response.data;
};

export const updateWechatUserInfo = async (userInfo: any): Promise<any> => {
  const response = await put("/userinfo", userInfo);
  return response.data;
};
