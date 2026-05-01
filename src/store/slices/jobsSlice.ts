import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

import { getJobsRequest } from "../../api/jobsApi";
import { logoutUser } from "./authSlice";
import type { Job } from "../../types";

const getAppliedJobsKey = (userKey?: string) =>
  `jobapp_applied_jobs_${userKey ?? "guest"}`;

type GetJobsArgs = {
  page?: number;
  searchQuery?: string;
  orderField?: "createdAt" | "salary";
  orderDirection?: "asc" | "desc";
};

type JobsState = {
  jobs: Job[];
  appliedJobs: Job[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  page: number;
  perPage: number;
  total: number;
  hasNextPage: boolean;
};

const initialState: JobsState = {
  jobs: [],
  appliedJobs: [],
  loading: false,
  loadingMore: false,
  error: null,
  page: 1,
  perPage: 10,
  total: 0,
  hasNextPage: false,
};

export const getJobs = createAsyncThunk(
  "jobs/getJobs",
  async (args: GetJobsArgs | undefined, thunkApi) => {
    const state = thunkApi.getState() as any;
    const session = state.auth.session;
    const token = session?.accessToken ?? session?.token;

    try {
      return await getJobsRequest({
        token,
        tokenType: session?.tokenType ?? "Bearer",
        page: args?.page,
        searchQuery: args?.searchQuery,
        orderField: args?.orderField,
        orderDirection: args?.orderDirection,
      });
    } catch (error) {
      if ((error as any)?.response?.status === 401) {
        thunkApi.dispatch(logoutUser());
      }

      throw error;
    }
  }
);

const getCurrentUserKey = (state: any) => {
  const user = state.auth.session?.user;

  return user?.id ?? user?.email;
};

const saveAppliedJobs = async (jobs: Job[], userKey?: string) => {
  await SecureStore.setItemAsync(
    getAppliedJobsKey(userKey),
    JSON.stringify(jobs)
  );
};

export const restoreAppliedJobs = createAsyncThunk(
  "jobs/restoreAppliedJobs",
  async (_, thunkApi) => {
    const state = thunkApi.getState() as any;
    const userKey = getCurrentUserKey(state);

    if (!userKey) {
      return [];
    }

    const storedJobs = await SecureStore.getItemAsync(getAppliedJobsKey(userKey));

    return storedJobs ? (JSON.parse(storedJobs) as Job[]) : [];
  }
);

export const applyJobAndSave = createAsyncThunk(
  "jobs/applyJobAndSave",
  async (job: Job, thunkApi) => {
    const state = thunkApi.getState() as any;
    const appliedJobs = state.jobs.appliedJobs as Job[];
    const userKey = getCurrentUserKey(state);
    const alreadyApplied = appliedJobs.some(item => item.id === job.id);
    const nextAppliedJobs = alreadyApplied ? appliedJobs : [...appliedJobs, job];

    await saveAppliedJobs(nextAppliedJobs, userKey);

    return nextAppliedJobs;
  }
);

export const withdrawJobAndSave = createAsyncThunk(
  "jobs/withdrawJobAndSave",
  async (jobId: string, thunkApi) => {
    const state = thunkApi.getState() as any;
    const appliedJobs = state.jobs.appliedJobs as Job[];
    const userKey = getCurrentUserKey(state);
    const nextAppliedJobs = appliedJobs.filter(job => job.id !== jobId);

    await saveAppliedJobs(nextAppliedJobs, userKey);

    return nextAppliedJobs;
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    applyJob(state, action: PayloadAction<Job>) {
      const alreadyApplied = state.appliedJobs.some(
        job => job.id === action.payload.id
      );

      if (!alreadyApplied) {
        state.appliedJobs.push(action.payload);
      }
    },
    withdrawJob(state, action: PayloadAction<string>) {
      state.appliedJobs = state.appliedJobs.filter(
        job => job.id !== action.payload
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getJobs.pending, (state, action) => {
        state.error = null;

        if ((action.meta.arg?.page ?? 1) > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;

        const { data, meta } = action.payload;
        const loadedCount = meta.page * meta.perPage;

        state.jobs = meta.page > 1 ? [...state.jobs, ...data] : data;
        state.page = meta.page;
        state.perPage = meta.perPage;
        state.total = meta.total;
        state.hasNextPage = loadedCount < meta.total;
      })
      .addCase(getJobs.rejected, state => {
        state.loading = false;
        state.loadingMore = false;
        state.error = "Unable to load job listings";
      })
      .addCase(restoreAppliedJobs.fulfilled, (state, action) => {
        state.appliedJobs = action.payload;
      })
      .addCase(applyJobAndSave.fulfilled, (state, action) => {
        state.appliedJobs = action.payload;
      })
      .addCase(withdrawJobAndSave.fulfilled, (state, action) => {
        state.appliedJobs = action.payload;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.jobs = [];
        state.appliedJobs = [];
        state.loading = false;
        state.loadingMore = false;
        state.error = null;
        state.page = 1;
        state.perPage = 10;
        state.total = 0;
        state.hasNextPage = false;
      });
  },
});

export const { applyJob, withdrawJob } = jobsSlice.actions;
export default jobsSlice.reducer;
