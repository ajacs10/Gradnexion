# 💻 Gradnexion — Web Client Application

![Component Platform](https://img.shields.io/badge/Platform-Web_Portal-blue?style=for-the-badge)
![Build Tool](https://img.shields.io/badge/Build_Tool-Vite_&_HMR-purple?style=for-the-badge)
![UI Framework](https://img.shields.io/badge/UI-React_19_/_Tailwind-emerald?style=for-the-badge)

> Esta diretoria aloja o código-fonte do cliente Web da **Gradnexion**. Uma SPA (Single Page Application) de alta performance compilada via Vite, projetada para servir como o portal executivo das empresas (RH) e painel analítico dos finalistas no panorama angolano.

---

## 🧠 Significado do Nome (Brand Engineering)

O nome **Gradnexion** é um neologismo de elite construído sob princípios de engenharia semântica, projetado para evitar colisões de *namespace* no mercado e fixar autoridade imediata:

*   **Grad- (Proveniente de *Graduate* / *Graduation*):** Identifica o público-alvo core da plataforma — os **finalistas universitários** e recém-graduados que detêm o conhecimento técnico atualizado e estão prontos para o mercado.
*   **-nexion (Variação estilizada de *Connexion* / *Nexus*):** Do latim *Nexus*, que significa "elo", "vínculo" ou "o ponto central de intersecção onde as redes se unem".

**Conceito Comercial:** A **Gradnexion** posiciona-se como a infraestrutura de rede definitiva, o elo tecnológico síncrono que faltava em Angola para conectar de forma cirúrgica a academia (finalistas) ao ecossistema corporativo (empresas). O uso do "X" fonético confere uma identidade de produto moderna, disruptiva e de alta tecnologia.

---

## 🏛️ Arquitetura do Frontend (Design Pattern)

Para suportar fluxos de dados densos (Dashboards estilo *Bento Grid* e painéis analíticos) mantendo a manutenibilidade do código, o projeto segue regras estritas de isolamento:

1. **Arquitetura Atómica de Componentes:** UI componentizada em elementos puros, reutilizáveis e sem efeitos colaterais (Side Effects).
2. **Regra dos 80% (Custom Hooks & Services):** Toda a lógica de comunicação com a API (Axios/Fetch), gerenciamento de estados assíncronos (React Query) e mutações de dados está estritamente isolada em Custom Hooks. O componente visual apenas consome o estado produzido.

```text
src/
├── assets/          # Recursos estáticos (Logos, SVGs, Imagens)
├── components/      # UI Pura (Buttons, Inputs, Modals, BentoCards)
├── hooks/           # Abstração de Lógica de Negócios (80% Reusability)
├── pages/           # Camada de Roteamento e Views Principais
│   ├── Corporate/   # Dashboards e Pipelines de Empresas (Recrutadores)
│   └── Student/     # Perfil Académico, Portfólio e Status de Match
├── services/        # Clientes de API, Interceptors e Adaptadores de Dados
├── styles/          # Configurações Globais do Tailwind CSS
└── App.tsx          # Ponto de Entrada da Aplicação e Core Providers
