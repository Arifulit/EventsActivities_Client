import api from './api';

export interface ChangeRoleResponse {
  success: boolean;
  message: string;
  data: any;
  timestamp: string;
}

export interface ChangeRoleData {
  role: 'user' | 'host' | 'admin';
}

export interface VerifyUserResponse {
  success: boolean;
  message: string;
  data: any;
  timestamp: string;
}

export const changeUserRole = async (userId: string, roleData: ChangeRoleData): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, roleData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const verifyUser = async (userId: string): Promise<VerifyUserResponse> => {
  try {
    const response = await api.patch(`/admin/users/${userId}/verify`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const approveHost = async (userId: string): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role: 'host' });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const demoteToUser = async (userId: string): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role: 'user' });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const banUser = async (userId: string): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.put(`/admin/users/${userId}/ban`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const unbanUser = async (userId: string): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.put(`/admin/users/${userId}/unban`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
