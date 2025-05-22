import {
  IconAutomation,
  IconBrandHipchat,
  IconLayoutDashboard,
  IconLibrary,
  IconMessages,
  IconPencilPlus,
  IconRobot,
  IconTools,
} from "@tabler/icons-react";
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export const sidebarElementsData: any = {
  teams: [
    {
      name: "Shadcn Admin",
      logo: Command,
      plan: "Vite + ShadcnUI",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: IconLayoutDashboard,
        },
        {
          title: "Chats",
          url: "/chats",
          badge: "3",
          icon: IconMessages,
        },
      ],
    },
    {
      title: "Agents",
      items: [
        {
          title: "List",
          icon: IconRobot,
          url: "/dashboard/agents",
        },
        {
          title: "Create",
          icon: IconAutomation,
          url: "/dashboard/agents/create",
        },
      ],
    },
    {
      title: "Tools",
      items: [
        {
          title: "List",
          icon: IconTools,
          url: "/dashboard/tools",
        },
      ],
    },
    {
      title: "Knowledge bases",
      items: [
        {
          title: "List",
          icon: IconLibrary,
          url: "/dashboard/knowledge-bases",
        },
      ],
    },
  ],
};

export default function useGetSidebarElements() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [sidebarElements, setSidebarElements] = useState<any>(sidebarElementsData);

  useEffect(() => {
    if (projectId) {
      setSidebarElements({
        teams: [
          {
            name: "Shadcn Admin",
            logo: Command,
            plan: "Vite + ShadcnUI",
          },
          {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
          },
          {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
          },
        ],
        navGroups: [
          {
            title: "General",
            items: [
              {
                title: "Dashboard",
                url: `/dashboard/${projectId}`,
                icon: IconLayoutDashboard,
              },
              {
                title: "Chats",
                url: `/dashboard/${projectId}/chats`,
                badge: "3",
                icon: IconMessages,
              },
            ],
          },
          {
            title: "Agents",
            items: [
              {
                title: "List",
                icon: IconRobot,
                url: `/dashboard/${projectId}/agents`,
              },
              {
                title: "Create",
                icon: IconAutomation,
                url: `/dashboard/${projectId}/agents/create`,
              },
            ],
          },
          {
            title: "Tools",
            items: [
              {
                title: "List",
                icon: IconTools,
                url: `/dashboard/${projectId}/tools`,
              },
              {
                title: "Create",
                icon: IconPencilPlus,
                url: `/dashboard/${projectId}/tools/create`,
              },
            ],
          },
          // {
          //   title: 'Knowledge bases',
          //   items: [
          //     {
          //       title: 'List',
          //       icon: IconLibrary,
          //       url: `/dashboard/${projectId}/knowledge-bases`,
          //     },
          //   ],
          // },
          {
            title: "Chat widgets",
            items: [
              {
                title: "List",
                icon: IconBrandHipchat,
                url: `/dashboard/${projectId}/chat-widgets`,
              },
            ],
          },
        ],
      });
    }
  }, [projectId]);

  return { sidebarElements };
}
