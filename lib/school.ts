// Everything school-specific lives here. Adding a school later means adding a config
// and choosing which one is active.
export type SchoolConfig = {
  name: string; // Short name used in copy and the matching prompt
  hubName: string; // What students see as the product name
  accent: string; // Buttons, selected chips, small highlights
  emailDomain: string; // Shown on the signed-in student
};

export const BYU: SchoolConfig = {
  name: "BYU",
  hubName: "BYU Compass",
  accent: "#002E5D",
  emailDomain: "byu.edu",
};

export const SCHOOL: SchoolConfig = BYU;
