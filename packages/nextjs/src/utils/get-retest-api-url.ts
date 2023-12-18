export const getRetestAPIUrl = () =>
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://useretest.vercel.app";
