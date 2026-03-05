export type ExecutiveMemberData = {
  id: string
  name: string
  role: string
  year: string
  image: string
  description?: string
}

export const executives: ExecutiveMemberData[] = [
  {
    id: "1",
    name: "Alex Johnson",
    role: "President",
    year: "2024-2025",
    image: "/logos/PantherWeb-1.png",
    description: "Leads PantherWeb's vision and coordinates with university administration. Passionate about making web development accessible to all GSU students.",
  },
  {
    id: "2",
    name: "Jordan Smith",
    role: "Vice President",
    year: "2024-2025",
    image: "/logos/PantherWeb-2.png",
    description: "Supports the President and oversees workshop planning. Focuses on creating inclusive learning environments for developers at every level.",
  },
  {
    id: "3",
    name: "Taylor Williams",
    role: "Treasurer",
    year: "2024-2025",
    image: "/logos/PantherWeb-3.png",
    description: "Manages club finances and budget allocation. Ensures resources are available for projects and events throughout the semester.",
  },
  {
    id: "4",
    name: "Morgan Davis",
    role: "Secretary",
    year: "2024-2025",
    image: "/logos/PantherWeb-4.png",
    description: "Handles meeting notes, communications, and record-keeping. Keeps the organization running smoothly behind the scenes.",
  },
  {
    id: "5",
    name: "Casey Brown",
    role: "Tech Lead",
    year: "2024-2025",
    image: "/logos/PantherWeb-1.png",
    description: "Guides technical direction for club projects. Helps members learn modern frameworks and best practices in web development.",
  },
  {
    id: "6",
    name: "Riley Martinez",
    role: "Outreach Coordinator",
    year: "2024-2025",
    image: "/logos/PantherWeb-2.png",
    description: "Connects PantherWeb with the broader GSU community. Organizes recruitment events and partnerships with other student organizations.",
  },
  {
    id: "7",
    name: "Sam Wilson",
    role: "President",
    year: "2023-2024",
    image: "/logos/PantherWeb-3.png",
    description: "Led PantherWeb through a year of growth and new initiatives.",
  },
  {
    id: "8",
    name: "Jordan Lee",
    role: "Vice President",
    year: "2023-2024",
    image: "/logos/PantherWeb-1.png",
    description: "Supported workshop expansion and member engagement.",
  },
]

export const executiveYears = Array.from(
  new Set(executives.map((e) => e.year))
).sort((a, b) => b.localeCompare(a))
