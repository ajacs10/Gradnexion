import { Mail, Globe, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../assets/imagem/favicon.svg'

const footerLinks = [
  {
    title: 'Navegação',
    links: [
      { label: 'Início', href: '/' },
      { label: 'Sobre', href: '/#about' },
      { label: 'Vagas', href: '/vagas' },
      { label: 'Talentos', href: '/talentos' },
    ],
  },
  {
    title: 'Para Empresas',
    links: [
      { label: 'Publicar vaga', href: '/publicar' },
      { label: 'Entrar em contacto', href: '/contato' },
    ],
  },
]

const socialLinks = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: Camera, href: '#', label: 'Gallery' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.7fr)_repeat(2,minmax(9rem,1fr))]">
          <div className="max-w-sm">
            <img src={Logo} alt="GradNeXion" className="h-auto w-28" />
            <p className="mt-5 text-sm leading-relaxed text-white/65">
              GradNeXion conecta estudantes e empresas com oportunidades de estágio e talento.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/55 transition-colors duration-200 hover:[border-color:var(--color-design)] hover:text-[var(--color-design)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h6 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/80">{group.title}</h6>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-white/50 transition-colors duration-200 hover:text-[var(--color-design)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/50">
            <span>Luanda, Angola</span>
            <span className="text-white/20">•</span>
            <Mail className="h-4 w-4" />
            <a href="mailto:contact@gradnexion.ao" className="transition-colors hover:text-[var(--color-design)]">contact@gradnexion.ao</a>
          </div>
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} GradNeXion. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
