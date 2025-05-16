import { get, post, put, del } from "../apiUtils";
import { USER_ENDPOINTS } from "../constants";

// Types
export interface User {
  id: string | number;
  name: string;
  email: string;
  role: "ADMN" | "SADMN" | "CUST";
  phone?: string;
  username?: string;
  // Properti tambahan sesuai dengan respons API
  created_at?: string;
  updated_at?: string;
  total_spend?: string;
  api_token_expires_at?: string | null;
  remember_token?: string | null;
  deleted_at?: string | null;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// Sesuaikan struktur respons dengan API yang sebenarnya
export interface GetUsersResponse {
  data: User[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    search: string;
  };
}

// Format data yang diharapkan oleh komponen
export interface UserResponseData {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  phone?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  phone?: string;
  password?: string;
}

// Function to get all users with pagination, filtering and sorting
export const getUsers = async (
  params: GetUsersParams = {}
): Promise<UserResponseData> => {
  const queryParams = new URLSearchParams();

  // Add parameters to query string
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);

  // Handle multiple roles if provided as comma-separated string
  if (params.role) {
    if (params.role.includes(",")) {
      // Split comma-separated roles and add them as separate role parameters
      const roles = params.role.split(",").map((r) => r.trim());
      roles.forEach((role) => queryParams.append("role[]", role));
    } else {
      queryParams.append("role", params.role);
    }
  }

  if (params.status) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);

  const queryString = queryParams.toString()
    ? `?${queryParams.toString()}`
    : "";

  console.log(
    "Making API request to:",
    `${USER_ENDPOINTS.GET_USERS}${queryString}`
  );

  try {
    const response = await get<GetUsersResponse>(
      `${USER_ENDPOINTS.GET_USERS}${queryString}`
    );

    console.log("API Response received:", response);

    // Ekstrak dan format respons API ke struktur yang diharapkan komponen
    if (response && response.data && Array.isArray(response.data)) {
      // Format respons sesuai yang diharapkan oleh komponen
      return {
        users: response.data,
        total: response.meta?.total || response.data.length,
        page: response.meta?.page || params.page || 1,
        limit: response.meta?.perPage || params.limit || 10,
        totalPages: response.meta?.lastPage || 1,
      };
    }

    // Jika format tidak sesuai ekspektasi, coba adaptasi data lainnya
    console.warn("API response format not as expected - trying to adapt");

    // Respons mungkin berbentuk array langsung
    if (Array.isArray(response)) {
      return {
        users: response,
        total: response.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(response.length / (params.limit || 10)),
      };
    }

    // Respons mungkin memiliki format lain
    const responseObj = response as unknown as Record<string, unknown>;
    let users: User[] = [];

    // Coba berbagai kemungkinan struktur
    if (responseObj.data) {
      if (Array.isArray(responseObj.data)) {
        users = responseObj.data as User[];
      } else if (
        typeof responseObj.data === "object" &&
        responseObj.data !== null
      ) {
        const dataObj = responseObj.data as Record<string, unknown>;
        if (dataObj.users && Array.isArray(dataObj.users)) {
          users = dataObj.users as User[];
        }
      }
    } else if (responseObj.users && Array.isArray(responseObj.users)) {
      users = responseObj.users as User[];
    }

    return {
      users,
      total:
        responseObj.meta && typeof responseObj.meta === "object"
          ? ((responseObj.meta as Record<string, unknown>).total as number) ||
            users.length
          : users.length,
      page:
        responseObj.meta && typeof responseObj.meta === "object"
          ? ((responseObj.meta as Record<string, unknown>).page as number) ||
            params.page ||
            1
          : params.page || 1,
      limit:
        responseObj.meta && typeof responseObj.meta === "object"
          ? ((responseObj.meta as Record<string, unknown>).perPage as number) ||
            params.limit ||
            10
          : params.limit || 10,
      totalPages:
        responseObj.meta && typeof responseObj.meta === "object"
          ? ((responseObj.meta as Record<string, unknown>)
              .lastPage as number) || 1
          : 1,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      users: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 0,
    };
  }
};

// Function to get a single user by ID
export const getUser = async (id: string): Promise<User> => {
  return await get<User>(USER_ENDPOINTS.GET_USER(id));
};

// Function to create a new user
export const createUser = async (userData: CreateUserData): Promise<User> => {
  return await post<User>(USER_ENDPOINTS.CREATE_USER, userData);
};

// Function to update a user
export const updateUser = async (
  id: string,
  userData: UpdateUserData
): Promise<User> => {
  return await put<User>(USER_ENDPOINTS.UPDATE_USER(id), userData);
};

// Function to delete a user
export const deleteUser = async (id: string): Promise<void> => {
  await del<void>(USER_ENDPOINTS.DELETE_USER(id));
};

// Function to update user status
export const updateUserStatus = async (
  id: string,
  status: string
): Promise<User> => {
  return await put<User>(USER_ENDPOINTS.UPDATE_USER(id), { status });
};
