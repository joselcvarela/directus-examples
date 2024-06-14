declare namespace Express {
  interface Request {
    user: {
      email: string;
      id: string;
      first_name: string;
      last_name: string;
    } | null;
  }
}
