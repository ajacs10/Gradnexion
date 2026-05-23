# 🌐 Gradnexion — Corporate Talent Pipeline & Match Engine

![Status](https://img.shields.io/badge/Status-Production_Ready-emerald?style=for-the-badge)
![Environment](https://img.shields.io/badge/Environment-Angola_Market-orange?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-Clean_Architecture-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Enterprise_Grade-black?style=for-the-badge)

> **Gradnexion** é uma infraestrutura distribuída de alta performance projetada para mitigar a fricção de contratação de novos talentos no mercado corporativo angolano. A plataforma abstrai a complexidade do recrutamento tradicional, conectando cirurgicamente finalistas académicos a grandes *players* do mercado (Bancos, Telecomunicações e Oil & Gas) através de uma engine de alinhamento de competências baseado em dados normalizados.

---

## 🏛️ Decisões de Arquitetura e Engenharia (Architecture Decision Records)

A arquitetura do ecossistema foi projetada sob o princípio da **Separação de Responsabilidades (SoC)** e desacoplamento completo entre os canais de entrega (Web/Mobile) e o Core de Negócios.

### 1. Estratégia de Entrega Cross-Platform
*   **Web Portal (Next.js 15):** Utilização intensiva de *React Server Components (RSC)* para renderização no servidor (SSR) e otimização do Edge Runtime. Garante tempos de carregamento (FCP) inferiores a 1.2s mesmo sob infraestruturas de rede instáveis.
*   **Mobile Client (React Native / Expo SDK 55):** Desenvolvido com uma arquitetura monorepo nativa. A estilização via **NativeWind v4** unifica o compilador de estilos através da engine do Tailwind, garantindo consistência visual exata entre Web e Mobile sem overhead de runtime.

### 2. Abstração de Lógica de Negócios (Regra dos 80%)
Para evitar acoplamento rígido na camada de visualização, **80% de toda a lógica operacional** (chamadas de API, transformações de esquemas, gerenciamento de estados globais) reside estritamente em **Custom Hooks** e **Services isolados**. Componentes visuais atuam puramente como funções puras de renderização.

---

## 🛠️ Stack Tecnológica & Matriz de Justificação

| Camada | Tecnologia Selecionada | Justificação Arquitetural |
| :--- | :--- | :--- |
| **Front-end Web** | Next.js 15 (App Router) | Otimização de queries via Server Actions e cache agressivo na camada de dados. |
| **Mobile Native** | React Native + Expo SDK 55 | Consistência nativa, suporte a notificações push de baixa latência e otimização de memória. |
| **Styling Core** | Tailwind CSS / NativeWind v4 | Estilização preditiva através de utilitários utility-first compilados em build time. |
| **ORM / DB Access**| Prisma ORM | Tipagem estática fim-a-fim, mapeamento declarativo e tratamento automático de pools de conexões. |
| **Database** | PostgreSQL | Suporte robusto a transações ACID, integridade referencial estrita e indexação eficiente para buscas relacionais. |

---

## 📊 Modelagem de Dados & Fluxo de Match (3NR)

A persistência adota a Terceira Forma Normal (3NR) para garantir anomalia zero em operações de escrita concorrente. Abaixo está o fluxo síncrono correto que rege a criação de um *pipeline* de talentos automatizado:

```mermaid
sequenceDiagram
    autonumber
    actor F as Finalista (Estudante)
    actor E as Enterprise (RH Empresa)
    participant API as Core API [Gradnexion]
    participant DB as PostgreSQL (3NR)
    
    F->>API: POST /api/v1/profiles (Dados Académicos + Portfólio)
    activate API
    API->>DB: Upsert StudentProfile & Skills (Normalized)
    DB-->>API: Persistido com Sucesso
    deactivate API
    
    E->>API: POST /api/v1/jobs (Requisitos de Competência)
    activate API
    API->>DB: Insert JobRequirement
    API->>API: Executa Query Transacional de Match Relacional
    API-->>E: Retorna Pipeline de Candidatos Filtrados (Match Score >= 80%)
    deactivate API
    
    E->>API: POST /api/v1/connections (Solicita Entrevista)
    API-->>F: Push Notification: "Nova Oportunidade Corporativa"
