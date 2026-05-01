import { api } from "./client";
import type { JobsResponse } from "../types";

type GetJobsParams = {
  token?: string;
  tokenType?: string;
  page?: number;
  perPage?: number;
  searchQuery?: string;
  orderField?: "createdAt" | "salary";
  orderDirection?: "asc" | "desc";
};

export const getJobsRequest = async ({
  token,
  tokenType = "Bearer",
  page = 1,
  perPage = 10,
  searchQuery = "",
  orderField = "createdAt",
  orderDirection = "desc",
}: GetJobsParams) => {
  if (!token) {
    throw new Error("Session not found");
  }

  const response = await api.get<JobsResponse>("/jobs", {
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
    params: {
      page,
      perPage,
      "orderBy[field]": orderField,
      "orderBy[direction]": orderDirection,
      ...(searchQuery
        ? {
            "search[field]": "companyName",
            "search[query]": searchQuery,
          }
        : {}),
    },
  });

  return response.data;
};
