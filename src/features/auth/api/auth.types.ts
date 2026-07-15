/** Request DTO for `POST /auth/login`. */
export type LoginInput = {
  email: string;
  password: string;
};

/** Request DTO for `POST /auth/signup`. */
export type SignupInput = {
  email: string;
  password: string;
  fullName: string;
  organization: {
    name: string;
    industry: string;
    companySize: string;
    websiteUrl?: string;
    primaryRegion: string;
    primaryLanguage: string;
  };
};
