import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import { Fragment } from "react";
import { HiChevronDown, HiUserCircle } from "react-icons/hi"; // Example icon
import useSWR from "swr";
import Container from "../widget/container";
import Error from "../widget/error";
import PrimaryText from "../widget/primary_text";
import Raw from "../widget/raw";
import WidgetIcon from "../widget/widget_icon";

import * as HiIcons from "react-icons/hi";
import * as LuIcons from "react-icons/lu";
import * as MdIcons from "react-icons/md";
import * as SiIcons from "react-icons/si";

const iconFamilies = ["lu", "md", "si", "hi"];

function ResolveReactIcon({ icon, ...props }) {
  let name = icon;
  let family = "lu";
  if (icon.includes("-")) {
    const parts = icon.split("-");
    if (iconFamilies.includes(parts[0])) {
      family = parts[0];
      name = parts[1];
    }
  }

  let IconComponent = undefined;

  switch (family) {
    case "lu":
      IconComponent = LuIcons[`Lu${name}`];
      break;
    case "md":
      IconComponent = MdIcons[`Md${name}`];
      break;
    case "si":
      IconComponent = SiIcons[`Si${name}`];
      break;
    case "hi":
      IconComponent = HiIcons[`Hi${name}`];
      break;
  }

  if (!IconComponent) {
    return <HiIcons.HiQuestionMarkCircle {...props} />;
  }
  return <IconComponent {...props} />;
}

function UserMenuAction({ url, text, icon, iconColor, focusBgColor }) {
  let iconColorClass = "text-theme-700 dark:text-theme-300";
  let focusColorClass = "bg-theme-300 dark:bg-theme-700";

  return (
    <MenuItem>
      {({ focus }) => (
        <a
          href={url}
          className={`${
            focus ? focusColorClass : iconColorClass
          } group flex w-full items-center rounded-md px-3 py-2 text-xs font-medium transition-colors`}
          style={focus && focusBgColor ? { backgroundColor: focusBgColor } : {}}
        >
          <ResolveReactIcon
            icon={icon}
            className={`mr-2 h-4 w-4`}
            aria-hidden="true"
            style={iconColor ? { color: iconColor } : {}}
          />
          <span style={iconColor ? { color: iconColor } : {}}>{text}</span>
        </a>
      )}
    </MenuItem>
  );
}

function UserMenu({ username, email, groups, actions }) {
  return (
    <div className="flex items-center justify-end h-8 my-4 min-w-fit z-20">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="flex items-center space-x-2 p-1 rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10 border border-theme-300 dark:border-theme-200/50">
            <WidgetIcon icon={HiUserCircle} size="l" />
            <div className="hidden flex-col items-end sm:flex leading-tight">
              <span className="text-xs font-bold text-theme-900 dark:text-theme-100">{username}</span>
            </div>
            <HiChevronDown size={14} className="text-theme-400" aria-hidden="true" />
          </MenuButton>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-theme-100 rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100 dark:bg-theme-800/90 border border-theme-300 dark:border-theme-300/5 backdrop-blur-md">
            {/* User Header Info */}
            <div className="px-4 py-3">
              <p className="text-xs text-theme-500 dark:text-theme-400">Signed in as</p>
              <p className="truncate text-sm font-bold text-theme-900 dark:text-theme-100">{email}</p>
            </div>

            {/* Groups Section */}
            <div className="p-2">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-theme-400">Groups</p>
              <div className="flex flex-wrap gap-1 px-2">
                {groups?.map((group) => (
                  <span
                    key={group}
                    className="inline-flex items-center rounded-md border border-theme-200/50 bg-theme-50 px-2 py-0.5 text-[10px] font-medium text-theme-600 dark:border-theme-700/50 dark:bg-theme-800 dark:text-theme-300"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            {actions?.map((action, index) => (
              <UserMenuAction
                key={action.text || index}
                text={action.text}
                url={action.href}
                icon={action.icon}
                iconColor={action.iconColor}
                focusBgColor={action.focusBgColor}
              />
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}

export default function ForwardAuthUser({ options }) {
  const { t } = useTranslation();

  const { data, error } = useSWR("/api/widgets/forward_auth_user");

  if (error || data?.error) {
    return <Error options={options} />;
  }

  if (!data) {
    return (
      <Container options={options}>
        <PrimaryText>Loading User...</PrimaryText>
        <WidgetIcon icon={HiUserCircle} size="l" pulse />
      </Container>
    );
  }

  return (
    <Container options={options} additionalClassNames="information-widget-user-forward">
      <Raw>
        <UserMenu username={data.username} email={data.email} groups={data.groups} actions={data.actions}></UserMenu>
      </Raw>
    </Container>
  );
}
