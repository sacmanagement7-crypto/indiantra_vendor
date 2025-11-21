import {
  Home,
  Image as BannerIcon,
  Boxes as ProductsIcon,
  Folder as CategoryIcon,
  FolderPlus as SubCategoryIcon,
  Newspaper as BlogIcon,
  MessageSquareQuote as TestimonialIcon,
  ShoppingCart as OrderIcon,
  Users,
  Settings,
} from "lucide-react";

export const navbarLinks = [
  {
    links: [
      {
        label: "Home",
        icon: Home,
        path: "/dashboard", // was "/"
      },
    ],
  },
  {
    title: "Users",
    links: [
        {
        label: "Products",
        icon: ProductsIcon,
        path: "/dashboard/products",
      },
        {
        label: "Orders",
        icon: OrderIcon,
        path: "/dashboard/orders",
      },
    ],
  },
  // {
  //   title: "Settings",
  //   links: [
  //     {
  //       label: "Settings",
  //       icon: Settings,
  //       path: "/dashboard/settings",
  //     },
  //   ],
  // },
];
