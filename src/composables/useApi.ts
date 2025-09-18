import { createFetch } from "@vueuse/core";
import { destr } from "destr";
import { useCookie } from "./useCookie";

export const useApi = createFetch({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL}/v1`,
  fetchOptions: {
    headers: { Accept: "application/json" },
  },
  options: {
    refetch: false,
    async beforeFetch({ options }) {
      const accessToken = useCookie("accessToken").value;

      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }

      return { options };
    },
    afterFetch(ctx) {
      const { data, response } = ctx;

      let parsedData = null;
      try {
        parsedData = destr(data);
      } catch (error) {
        console.error(error);
      }

      return { data: parsedData, response };
    },
  },
});
