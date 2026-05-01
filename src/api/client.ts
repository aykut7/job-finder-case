import axios from "axios";

export const api = axios.create({
  baseURL: "https://novel-project-ntj8t.ampt.app/api",
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});