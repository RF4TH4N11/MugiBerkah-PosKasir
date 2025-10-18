import axios from "axios";
import { BASE_URL } from "../constant";

export const http = axios.create({
  baseURL: BASE_URL + "/api",
});
