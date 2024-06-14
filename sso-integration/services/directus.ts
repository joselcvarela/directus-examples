import axios from "axios";
import { env } from "../env";

export const directus = axios.create({ baseURL: env.DIRECTUS_URL });
