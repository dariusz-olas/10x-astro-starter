interface NavButtonProps {
  href: string;
  icon: string;
  title: string;
  description: string;
}

export default function DashboardNav({ href, icon, title, description }: NavButtonProps) {
  return (
    <a
      href={href}
      className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 border-2 border-transparent hover:border-purple-500"
    >
      <div className="p-6 text-center">
        <div className="text-5xl mb-4 transition-transform group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <div className="mt-4 inline-flex items-center gap-2 text-purple-600 font-medium group-hover:gap-3 transition-all">
          <span>Przejdź</span>
          <span className="text-xl">→</span>
        </div>
      </div>
    </a>
  );
}

