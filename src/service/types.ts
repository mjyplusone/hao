// 通用类型定义

// 基础响应类型

// 分页请求参数
export interface PageParams {
  page: number;
  pageSize: number;
}

// 分页响应数据
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 用户信息类型
