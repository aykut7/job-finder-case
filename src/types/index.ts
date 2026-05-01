export type User = {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  phone?: string;
  profileImage?: string;
  dateOfBirth?: string;
  address?: {
    country?: string;
    city?: string;
    details?: string;
  };
  appliedJobs?: string[];
};


export type LoginResponse = {
  accessToken: string;
  token?: string;
  tokenType: string;
  refreshToken: string;
  user: User;
};

export type Job = {
  id: string;
  name: string;
  title?: string;
  company?: string;
  companyName?: string;
  createdAt?: string;
  location?: string;
  description?: string;
  salary?: number;
  keywords?: string[];
};

export type JobsResponse = {
  data: Job[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
};

export type UpdateUserData = {
  name: string;
  surname: string;
  phone: string;
  profileImage: string;
  dateOfBirth: string;
  address: {
    country: string;
    city: string;
    details: string;
  };
};
