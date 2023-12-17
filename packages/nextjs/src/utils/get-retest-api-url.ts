export const getRetestAPIUrl = () =>
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://use-retest.vercel.app";
