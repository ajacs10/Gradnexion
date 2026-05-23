// src/data/journalContent.js

const courseAreas = [
  {
    name: 'Informática e Sistemas de Informação',
    duration: '5 anos',
    theme: 'Tecnologia',
    summary: 'Software, dados, sistemas, produto digital e inovação aplicada.',
  },
  {
    name: 'Redes e Telecomunicações',
    duration: '5 anos',
    theme: 'Infraestrutura',
    summary: 'Conectividade, redes, segurança, suporte técnico e telecomunicações.',
  },
  {
    name: 'Contabilidade & Finanças',
    duration: '4 anos',
    theme: 'Negócios',
    summary: 'Finanças, auditoria, fiscalidade, controlo de gestão e análise.',
  },
  {
    name: 'Logística e Gestão Comercial',
    duration: '4 anos',
    theme: 'Operações',
    summary: 'Cadeia de abastecimento, vendas, negociação e gestão comercial.',
  },
  {
    name: 'Gestão de Recursos Humanos',
    duration: '4 anos',
    theme: 'Pessoas',
    summary: 'Talento, cultura organizacional, carreiras e desenvolvimento humano.',
  },
  {
    name: 'Hotelaria & Turismo',
    duration: '4 anos',
    theme: 'Serviços',
    summary: 'Hospitalidade, turismo, eventos, atendimento e gestão de experiências.',
  },
  {
    name: 'Direito',
    duration: '5 anos',
    theme: 'Jurídico',
    summary: 'Ciências jurídicas, cidadania, compliance, advocacia e administração.',
  },
  {
    name: 'Ciências Criminais',
    duration: '4 anos',
    theme: 'Justiça',
    summary: 'Investigação, prevenção, criminologia, segurança e análise social.',
  },
];


const journalContent = {
  header: {
    title: 'Finalista Connect',
    owner: '',
    navLinks: [
      { name: 'Talentos', path: '/talentos' },
      { name: 'Vagas', path: '/vagas' },
      { name: 'Empresas', path: '/empresas/vagas/nova' },
      { name: 'Guias', path: '/news' },
      { name: 'Login', path: '/login' },
    ],
  },
  hero: {
    label: 'Rede de talento universitário',
    title: 'O caminho mais direto entre finalistas preparados e empresas que contratam.',
    subtitle:
      'Perfis validados, vagas por área e entrevistas com videochamada para transformar talento académico em oportunidades reais de estágio.',
    stats: [
      { value: '8', label: 'áreas académicas' },
      { value: '4', label: 'vagas ativas' },
      { value: '1', label: 'ponte talento-empresa' },
    ],
  },
  courseAreas,
  sections: [
    {
      type: 'news',
      title: 'Guias de Carreira',
      description:
        'Conteúdos práticos para ajudar finalistas a apresentar competências, montar portfólio, preparar entrevistas e responder a oportunidades de estágio.',
      graphData: {
        labels: ['Informática', 'Redes', 'Finanças', 'Logística', 'RH', 'Jurídico'],
        datasets: [
          {
            label: 'Perfis publicados',
            data: [18, 12, 14, 10, 9, 11],
            backgroundColor: '#f7d046',
          },
        ],
      },
      content: [
        {
          id: 1,
          category: 'Perfil',
          title: 'Como finalistas de Informática podem chamar atenção das empresas',
          description:
            'Projetos de software, dashboards e protótipos ajudam recrutadores a avaliar competências.',
          fullText:
            'A área de Informática e Sistemas de Informação tem produzido estudantes com forte interesse em produto digital, dados e automação. O Finalista Connect organiza estes percursos num mural público, destacando competências, projetos finais e disponibilidade para estágio. A proposta é simples: transformar nomes de finalistas em perfis encontráveis por empresas, colegas e comunidades tecnológicas.',
          author: 'Redação Finalista Connect',
          time: '09 Mai 2026',
          likes: 32,
          dislikes: 0,
          imageUrl:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
        },
        {
          id: 2,
          category: 'Carreiras',
          title: 'Como apresentar o teu percurso para conseguir estágio',
          description:
            'Nome, curso, turma, competências e uma frase clara podem abrir portas para networking.',
          fullText:
            'Um bom perfil universitário não precisa parecer um currículo longo. O essencial é mostrar curso, ano de conclusão, área de interesse, competências e uma evidência concreta: projeto final, estágio, artigo, voluntariado ou experiência de laboratório. Na rede, cada finalista aparece por área para facilitar descoberta por empresas.',
          author: 'Finalista Connect',
          time: '08 Mai 2026',
          likes: 21,
          dislikes: 0,
          imageUrl:
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop',
        },
        {
          id: 3,
          category: 'Comunidade',
          title: 'Cursos ajudam empresas a encontrar perfis por área',
          description:
            'A rede organiza talentos por áreas como Direito, Finanças, Redes, RH, Turismo, Logística e Tecnologia.',
          fullText:
            'A estrutura da rede foi inspirada nas licenciaturas divulgadas publicamente pela INSUTEC: Direito, Ciências Criminais, Hotelaria & Turismo, Logística e Gestão Comercial, Gestão de Recursos Humanos, Contabilidade & Finanças, Redes e Telecomunicações, e Informática e Sistemas de Informação. A intenção é facilitar o encontro entre empresas e finalistas de diferentes áreas, sem assumir caráter institucional.',
          author: 'Redação Finalista Connect',
          time: '07 Mai 2026',
          likes: 18,
          dislikes: 0,
          imageUrl:
            'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop',
        },
      ],
    },
  ],
  events: [
    {
      day: '12',
      month: 'Mai',
      title: 'Roda de conversa: portfólio para finalistas',
      meta: 'Online | Tecnologia, RH e Gestão',
    },
    {
      day: '18',
      month: 'Mai',
      title: 'Mural aberto para novas turmas',
      meta: 'Submissão de perfis | Todas as áreas',
    },
    {
      day: '25',
      month: 'Mai',
      title: 'Especial: mulheres em tecnologia e negócios',
      meta: 'Finalista Connect | Rede comunitária',
    },
  ],
  highlights: {
    title: 'Destaque',
    text: 'A rede agora cruza finalistas, competências e vagas de estágio por área.',
  },
};

export default journalContent;
