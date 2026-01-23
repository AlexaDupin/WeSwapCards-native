import Chat from "@/src/assets/images/chatdeal.svg";
import Dashboard from "@/src/assets/images/dashboard.svg";
import Report from "@/src/assets/images/report.svg";
import Search from "@/src/assets/images/search.svg";
import Users from "@/src/assets/images/users.svg";

export const howItWorksSteps = [
  {
    Icon: Report,
    title: "Log your cards",
    subtitle: "Mark what you own or have duplicates of.",
  },
  {
    Icon: Search,
    title: "Find what you need",
    subtitle: "Browse chapters and spot missing cards.",
  },
  {
    Icon: Users,
    title: "Browse users",
    subtitle: "See who has the card you’re looking for.",
  },
  {
    Icon: Chat,
    title: "Chat & trade",
    subtitle: "Message users and agree on a swap.",
  },
  {
    Icon: Dashboard,
    title: "Track everything",
    subtitle: "Keep requests organized in your dashboard.",
  },
] as const;
