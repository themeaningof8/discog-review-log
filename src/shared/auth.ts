export type AuthProps = {
  auth: {
    user: {
      id: string;
      email: string;
      name: string;
      role: "writer" | "admin";
    } | null;
  };
};
