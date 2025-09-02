export interface LoginData {
  openid: string;
  session_key: string;
  unionid?: string;
  access_token?: string;
  expires_in?: number;
  userInfo?: UserInfo;
}

export interface UserInfo {
  id: string;
  openid: string;
  nickName: string;
  avatarUrl: string;
  gender: number;
  country: string;
  province: string;
  city: string;
  unionid?: string;
  createdAt: string;
  updatedAt: string;
}
