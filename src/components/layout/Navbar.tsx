import { NavLink } from "react-router-dom";
import logo from "../../assets/logo_2.png";
import { t } from "../../i18n";
import { useLangStore } from "../../stores/langStore";

const navItems = [
  { to: "/dashboard", labelKey: "nav.newMeeting" },
  { to: "/archive", labelKey: "nav.minutes" },
  { to: "/mypage", labelKey: "nav.mypage" },
];

export default function Navbar() {
  const lang = useLangStore((state) => state.lang);

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
      <NavLink to="/" className="flex items-center transition-transform hover:scale-[1.03]">
        <img src={logo} alt="Bridgenote" className="h-6 w-auto" />
      </NavLink>

      <nav className="flex items-center gap-7">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="relative py-1.5">
            {({ isActive }) => (
              <>
                <span
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t(item.labelKey, lang)}
                </span>
                <span
                  className={`absolute left-0 -bottom-0.5 h-[2px] bg-primary rounded-full transition-all duration-300 ease-out ${
                    isActive ? "w-full opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
