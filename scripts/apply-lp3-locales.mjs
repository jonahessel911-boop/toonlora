import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const es = {
  steps: {
    intro: "",
    categories: "Intereses",
    stories: "Intereses",
    time: "Intereses",
    feel: "Personalizado",
    habit: "Personalizado",
    depth: "Personalizado",
    quiz: "Personalizado",
    quiz2: "Personalizado",
    reveal: "Personalizado",
    stat: "Personalizado",
    profile: "Tu perfil",
    journey: "Tu plan",
    loading: "Personalizado",
    checkout: "Membresía",
  },
  intro: {
    title: "Personalicemos tu lista",
    subtitle: "Responde unas preguntas y descubre las historias de negocios más profundas del mundo.",
  },
  categories: { title: "¿Qué lado del negocio te fascina más?" },
  stories: {
    title: "¿Qué historias de negocios te interesan más?",
    tapOne: "Toca al menos una para continuar",
    selected: "{count} seleccionadas",
    fallbackSubtitle: "Historia de negocios",
  },
  time: { title: "¿Cuánto debe durar cada capítulo?" },
  feel: { title: "¿Qué quieres sentir después de cada historia?" },
  habit: { title: "¿Cuándo sueles leer historias?" },
  depth: { title: "¿Qué quieres sacar de cada historia de negocios?" },
  options: {
    feel: {
      "fired-up": "Motivado",
      shocked: "Impactado",
      smarter: "Más listo",
      hungrier: "Con más hambre",
      strategic: "Más estratégico",
      clear: "Con la mente clara",
    },
    time: {
      "5": "5 minutos — un capítulo intenso",
      "10": "10 minutos — episodio completo",
      "15": "15+ minutos — profundizar",
    },
    habit: {
      morning: "Camino al trabajo",
      lunch: "Pausa del almuerzo",
      evening: "Relajación nocturna",
      weekend: "Maratón de fin de semana",
    },
    depth: {
      strategy: "Estrategia y decisiones",
      drama: "Drama y juegos de poder",
      numbers: "Dinero y mercados",
      lessons: "Lecciones aplicables",
    },
  },
  quiz1: {
    question: "Apple estuvo a 90 días de la quiebra cuando Steve Jobs regresó. ¿Cuánto tardó en ser rentable?",
    options: { "30": "30 días", "365": "Un año", "730": "Dos años", "1095": "Tres años" },
    explanation: "Jobs recortó productos, consiguió inversión de Microsoft y reenfocó Apple — de vuelta a números negros en un año.",
  },
  quiz2: {
    question: "WeWork alcanzó una valoración de 47 mil millones antes de su OPI. ¿Cuánto valía meses después?",
    options: { "1": "1.000 millones $", "8": "8.000 millones $", "10": "10.000 millones $", "47": "47.000 millones $" },
    explanation: "Tras filtrarse el S-1, los inversores vieron las pérdidas. La OPI colapsó y la valoración se desplomó.",
  },
  reveal: { publicRecord: "Registro público", realStory: "Historia real" },
  reveals: {
    "steve-jobs": {
      headline: "Lo que Apple ocultó sobre el regreso de Jobs",
      record: "Steve Jobs — cofundador. Expulsado en 1985. Regresó como CEO interino en 1997.",
      real: "La junta le ofreció el puesto en una conversación en el aparcamiento. Su primer movimiento no fue un producto — fue cancelar casi todos los proyectos de Apple.",
      tags: ["COMEBACK", "APPLE", "FOCO"],
    },
    "elon-musk": {
      headline: "Lo que Tesla ocultó sobre la Nochebuena de 2008",
      record: "Elon Musk — CEO de Tesla y SpaceX. Casi sin efectivo a finales de 2008.",
      real: "Ambas empresas estaban a días de morir. Apostó sus últimos dólares personales a un lanzamiento más del Falcon 1 — y un acuerdo con Daimler que salvó a Tesla.",
      tags: ["NEAR-DEATH", "TESLA", "SPACEX"],
    },
    ferrari: {
      headline: "Lo que Enzo ocultó sobre el trato con Ford",
      record: "Enzo Ferrari — fundador. Casi vendió Ferrari a Ford en 1963.",
      real: "Se retiró por una cláusula sobre control de carreras. La furia de Ford financió el programa GT40 — y el mito de Ferrari se afiló.",
      tags: ["EGO", "CARRERAS", "LEGADO"],
    },
    default: {
      headline: "Lo que las actas de la junta nunca dijeron",
      record: "La historia oficial — pulida para inversores y prensa.",
      real: "Las decisiones reales ocurrieron en llamadas nocturnas, decks filtrados y apuestas que nadie quería por escrito.",
      tags: ["ESTRATEGIA", "PODER", "VERDAD"],
    },
  },
  stat: { text: "de los lectores dice que entiende mejor una historia de negocios tras un capítulo de Toonlora." },
  profile: {
    title: "Tu perfil",
    interestMap: "Tu mapa de intereses",
    stats: { sagas: "historias de negocios", perChapter: "por capítulo", match: "coincidencia", categories: "categorías desbloqueadas" },
  },
  archetypes: {
    founder_stories: {
      title: "La mirada del constructor",
      description: "Te atraen la obsesión, el ego y las decisiones que convierten a los fundadores en leyendas — o advertencias.",
      traits: ["Estrategia", "Obsesión", "Riesgo", "Visión", "Legado", "Presión"],
    },
    rise_and_fall: {
      title: "El observador de la caída",
      description: "Quieres la subida y el crash — arrogancia, negación y el momento en que todo se rompe.",
      traits: ["Arrogancia", "Poder", "Negación", "Colapso", "Lecciones", "Drama"],
    },
    empires: {
      title: "El arquitecto del imperio",
      description: "Te importa cómo las marcas escalan, dominan categorías y defienden ventajas durante décadas.",
      traits: ["Escala", "Marca", "Ventajas", "Cultura", "Dominio", "Operaciones"],
    },
    heists_and_frauds: {
      title: "El detective de tratos",
      description: "Te atraen el fraude, el apalancamiento y quienes doblaron las reglas hasta que el sistema cedió.",
      traits: ["Fraude", "Apalancamiento", "Secretos", "Poder", "Codicia", "Justicia"],
    },
    default: {
      title: "El lector estratégico",
      description: "Quieres la historia real detrás de movimientos multimillonarios — no la versión del comunicado de prensa.",
      traits: ["Estrategia", "Finanzas", "Liderazgo", "Riesgo", "Mercados", "Verdad"],
    },
  },
  journey: {
    badge: "Personalizado para ti",
    title: "En 30 días conocerás las historias que los titulares omiten",
    subtitle: "Según lo que elegiste, este es tu camino.",
    weeks: [
      { label: "Ahora", title: "Tu lista está lista" },
      { label: "Semana 1–2", title: "Sagas de fundadores y análisis" },
      { label: "Semana 3–4", title: "Ascensos, caídas y fraudes" },
      { label: "Mes 1", title: "Biblioteca completa desbloqueada", crown: true },
    ],
  },
  loading: {
    headline: "Personalizando tu lista de negocios",
    title: "Creando tu plan personalizado",
    tasks: {
      "0": "Analizando tus respuestas",
      "1": "Emparejando categorías y tono",
      "2": "Buscando historias para ti",
      "3": "Ordenando tu lista",
      "4": "Calibrando el ritmo de capítulos",
      "5": "Creando tu plan personalizado",
    },
  },
  checkout: { readStoriesLike: "Lee historias como:", trustedByReaders: "Con la confianza de lectores" },
  reviews: {
    "0": { timeAgo: "hace 2 días", title: "¡Me encanta esta app!", body: "Pensé que sabía todo sobre Steve Jobs. La lucha por volver a Apple fue mucho más brutal que en cualquier documental — y los paneles golpean más fuerte." },
    "1": { timeAgo: "hace 1 semana", title: "La forma perfecta de relajarse tras un día caótico", body: "Las historias de fundadores te transportan a otro mundo. Agudas, cinematográficas y sorprendentemente emotivas. Cada capítulo deja con ganas de uno más — sin un podcast de tres horas." },
    "2": { timeAgo: "hace 3 días", title: "La descargué para una lectura rápida", body: "Esperaba una escapada breve, pero me enganché a la saga de FTX al instante. Como Succession, pero con balances reales y mucho más en juego." },
  },
};

const fr = {
  steps: {
    intro: "",
    categories: "Intérêts",
    stories: "Intérêts",
    time: "Intérêts",
    feel: "Personnalisé",
    habit: "Personnalisé",
    depth: "Personnalisé",
    quiz: "Personnalisé",
    quiz2: "Personnalisé",
    reveal: "Personnalisé",
    stat: "Personnalisé",
    profile: "Votre profil",
    journey: "Votre plan",
    loading: "Personnalisé",
    checkout: "Abonnement",
  },
  intro: {
    title: "Personnalisons votre liste",
    subtitle: "Répondez à quelques questions et découvrez les histoires business les plus approfondies au monde.",
  },
  categories: { title: "Quel aspect du business vous fascine le plus ?" },
  stories: {
    title: "Quelles histoires business vous intriguent le plus ?",
    tapOne: "Touchez au moins une pour continuer",
    selected: "{count} sélectionnées",
    fallbackSubtitle: "Histoire business",
  },
  time: { title: "Quelle durée pour chaque chapitre ?" },
  feel: { title: "Que voulez-vous ressentir après chaque histoire ?" },
  habit: { title: "Quand lisez-vous habituellement ?" },
  depth: { title: "Que voulez-vous tirer de chaque histoire business ?" },
  options: {
    feel: {
      "fired-up": "Motivé",
      shocked: "Choqué",
      smarter: "Plus malin",
      hungrier: "Plus affamé",
      strategic: "Plus stratégique",
      clear: "L'esprit clair",
    },
    time: {
      "5": "5 minutes — un chapitre percutant",
      "10": "10 minutes — épisode complet",
      "15": "15+ minutes — plongée profonde",
    },
    habit: {
      morning: "Trajet du matin",
      lunch: "Pause déjeuner",
      evening: "Détente du soir",
      weekend: "Binge du week-end",
    },
    depth: {
      strategy: "Stratégie et décisions",
      drama: "Drame et jeux de pouvoir",
      numbers: "Argent et marchés",
      lessons: "Leçons applicables",
    },
  },
  quiz1: {
    question: "Apple était à 90 jours de la faillite quand Steve Jobs est revenu. Combien de temps avant la rentabilité ?",
    options: { "30": "30 jours", "365": "Un an", "730": "Deux ans", "1095": "Trois ans" },
    explanation: "Jobs a coupé des produits, obtenu un investissement Microsoft et recentré Apple — de retour dans le vert en un an.",
  },
  quiz2: {
    question: "WeWork valait 47 milliards $ avant son IPO. Quelle était sa valeur quelques mois plus tard ?",
    options: { "1": "1 milliard $", "8": "8 milliards $", "10": "10 milliards $", "47": "47 milliards $" },
    explanation: "Après la fuite du S-1, les investisseurs ont vu les pertes. L'IPO a échoué et la valorisation s'est effondrée.",
  },
  reveal: { publicRecord: "Version publique", realStory: "Histoire réelle" },
  reveals: {
    "steve-jobs": {
      headline: "Ce qu'Apple a caché sur le retour de Jobs",
      record: "Steve Jobs — cofondateur. Évincé en 1985. Revenu PDG intérimaire en 1997.",
      real: "Le conseil lui a offert le poste dans une conversation de parking. Son premier geste n'était pas un produit — c'était d'arrêter presque tous les projets Apple.",
      tags: ["COMEBACK", "APPLE", "FOCUS"],
    },
    "elon-musk": {
      headline: "Ce que Tesla a caché sur le réveillon 2008",
      record: "Elon Musk — PDG de Tesla et SpaceX. Presque à sec fin 2008.",
      real: "Les deux entreprises étaient à quelques jours de la mort. Il a mis ses derniers dollars sur un autre lancement Falcon 1 — et un accord Daimler qui a sauvé Tesla.",
      tags: ["NEAR-DEATH", "TESLA", "SPACEX"],
    },
    ferrari: {
      headline: "Ce qu'Enzo a caché sur l'accord Ford",
      record: "Enzo Ferrari — fondateur. A failli vendre Ferrari à Ford en 1963.",
      real: "Il est parti à cause d'une clause sur le contrôle des courses. La rage de Ford a financé le programme GT40 — et le mythe Ferrari s'est affûté.",
      tags: ["EGO", "COURSE", "HÉRITAGE"],
    },
    default: {
      headline: "Ce que les procès-verbaux n'ont jamais dit",
      record: "L'histoire officielle — polie pour investisseurs et presse.",
      real: "Les vraies décisions se prenaient dans des appels nocturnes, des decks filtrés et des paris que personne ne voulait écrire.",
      tags: ["STRATÉGIE", "POUVOIR", "VÉRITÉ"],
    },
  },
  stat: { text: "des lecteurs disent mieux comprendre une histoire business après un chapitre Toonlora." },
  profile: {
    title: "Votre profil",
    interestMap: "Votre carte d'intérêts",
    stats: { sagas: "histoires business", perChapter: "par chapitre", match: "correspondance", categories: "catégories débloquées" },
  },
  archetypes: {
    founder_stories: {
      title: "Le regard du bâtisseur",
      description: "Vous êtes attiré par l'obsession, l'ego et les décisions qui font des fondateurs des légendes — ou des mises en garde.",
      traits: ["Stratégie", "Obsession", "Risque", "Vision", "Héritage", "Pression"],
    },
    rise_and_fall: {
      title: "L'observateur de la chute",
      description: "Vous voulez l'ascension et le crash — hubris, déni et le moment où tout casse.",
      traits: ["Hubris", "Pouvoir", "Déni", "Effondrement", "Leçons", "Drame"],
    },
    empires: {
      title: "L'architecte d'empire",
      description: "Vous voulez savoir comment les marques passent à l'échelle, dominent des catégories et défendent leurs avantages pendant des décennies.",
      traits: ["Échelle", "Marque", "Avantages", "Culture", "Domination", "Ops"],
    },
    heists_and_frauds: {
      title: "Le détective de deals",
      description: "Vous êtes attiré par la fraude, l'effet de levier et ceux qui ont plié les règles jusqu'à la rupture.",
      traits: ["Fraude", "Levier", "Secrets", "Pouvoir", "Avarice", "Justice"],
    },
    default: {
      title: "Le lecteur stratégique",
      description: "Vous voulez la vraie histoire derrière les mouvements à milliards — pas la version communiqué de presse.",
      traits: ["Stratégie", "Finance", "Leadership", "Risque", "Marchés", "Vérité"],
    },
  },
  journey: {
    badge: "Personnalisé pour vous",
    title: "Dans 30 jours, vous connaîtrez les histoires que les gros titres ignorent",
    subtitle: "Selon vos choix, voici votre parcours.",
    weeks: [
      { label: "Maintenant", title: "Votre liste est prête" },
      { label: "Semaine 1–2", title: "Sagas de fondateurs et analyses" },
      { label: "Semaine 3–4", title: "Ascensions, chutes et fraudes" },
      { label: "Mois 1", title: "Bibliothèque complète débloquée", crown: true },
    ],
  },
  loading: {
    headline: "Personnalisation de votre liste business",
    title: "Création de votre plan personnalisé",
    tasks: {
      "0": "Analyse de vos réponses",
      "1": "Correspondance catégories et ambiance",
      "2": "Recherche d'histoires pour vous",
      "3": "Classement de votre liste",
      "4": "Calibrage du rythme des chapitres",
      "5": "Création de votre plan personnalisé",
    },
  },
  checkout: { readStoriesLike: "Lisez des histoires comme :", trustedByReaders: "Approuvé par les lecteurs" },
  reviews: {
    "0": { timeAgo: "il y a 2 jours", title: "J'adore cette app !", body: "Je pensais tout savoir sur Steve Jobs. Le combat pour revenir chez Apple était bien plus brutal que dans n'importe quel documentaire — et les cases frappent plus fort." },
    "1": { timeAgo: "il y a 1 semaine", title: "La façon parfaite de décompresser après une journée chaotique", body: "Les histoires de fondateurs vous plongent ailleurs. Percutantes, cinématographiques et étonnamment émouvantes. Chaque chapitre donne envie d'un de plus — sans podcast de trois heures." },
    "2": { timeAgo: "il y a 3 jours", title: "Je l'ai téléchargée pour une lecture rapide", body: "J'attendais une courte évasion, mais j'ai été accroché par la saga FTX presque immédiatement. Comme Succession, mais avec de vrais bilans et des enjeux bien plus élevés." },
  },
};

const pt = {
  steps: {
    intro: "",
    categories: "Interesses",
    stories: "Interesses",
    time: "Interesses",
    feel: "Personalizado",
    habit: "Personalizado",
    depth: "Personalizado",
    quiz: "Personalizado",
    quiz2: "Personalizado",
    reveal: "Personalizado",
    stat: "Personalizado",
    profile: "Seu perfil",
    journey: "Seu plano",
    loading: "Personalizado",
    checkout: "Assinatura",
  },
  intro: {
    title: "Vamos personalizar sua lista",
    subtitle: "Responda algumas perguntas e descubra as histórias de negócios mais profundas do mundo.",
  },
  categories: { title: "Qual lado dos negócios mais te fascina?" },
  stories: {
    title: "Quais histórias de negócios mais te interessam?",
    tapOne: "Toque em pelo menos uma para continuar",
    selected: "{count} selecionadas",
    fallbackSubtitle: "História de negócios",
  },
  time: { title: "Quanto tempo cada capítulo deve ter?" },
  feel: { title: "O que você quer sentir depois de cada história?" },
  habit: { title: "Quando você costuma ler histórias?" },
  depth: { title: "O que você mais quer de uma história de negócios?" },
  options: {
    feel: {
      "fired-up": "Motivado",
      shocked: "Chocado",
      smarter: "Mais esperto",
      hungrier: "Com mais fome",
      strategic: "Mais estratégico",
      clear: "Mente clara",
    },
    time: {
      "5": "5 minutos — um capítulo intenso",
      "10": "10 minutos — episódio completo",
      "15": "15+ minutos — mergulho profundo",
    },
    habit: {
      morning: "Trajeto da manhã",
      lunch: "Pausa do almoço",
      evening: "Relaxamento à noite",
      weekend: "Maratona de fim de semana",
    },
    depth: {
      strategy: "Estratégia e decisões",
      drama: "Drama e jogos de poder",
      numbers: "Dinheiro e mercados",
      lessons: "Lições aplicáveis",
    },
  },
  quiz1: {
    question: "A Apple estava a 90 dias da falência quando Steve Jobs voltou. Quanto tempo até a lucratividade?",
    options: { "30": "30 dias", "365": "Um ano", "730": "Dois anos", "1095": "Três anos" },
    explanation: "Jobs cortou produtos, garantiu investimento da Microsoft e refoCou a Apple — de volta ao lucro em um ano.",
  },
  quiz2: {
    question: "A WeWork valia US$ 47 bi antes do IPO. Quanto valia meses depois?",
    options: { "1": "US$ 1 bi", "8": "US$ 8 bi", "10": "US$ 10 bi", "47": "US$ 47 bi" },
    explanation: "Após o vazamento do S-1, investidores viram as perdas. O IPO colapsou e a valorização despencou.",
  },
  reveal: { publicRecord: "Registro público", realStory: "História real" },
  reveals: {
    "steve-jobs": {
      headline: "O que a Apple escondeu sobre o retorno de Jobs",
      record: "Steve Jobs — cofundador. Demitido em 1985. Voltou como CEO interino em 1997.",
      real: "O conselho ofereceu o cargo em uma conversa no estacionamento. Seu primeiro movimento não foi um produto — foi encerrar quase todos os projetos da Apple.",
      tags: ["COMEBACK", "APPLE", "FOCO"],
    },
    "elon-musk": {
      headline: "O que a Tesla escondeu sobre a véspera de Natal de 2008",
      record: "Elon Musk — CEO da Tesla e SpaceX. Quase sem caixa no fim de 2008.",
      real: "As duas empresas estavam a dias da morte. Ele apostou seus últimos dólares em mais um lançamento Falcon 1 — e um acordo com a Daimler que salvou a Tesla.",
      tags: ["NEAR-DEATH", "TESLA", "SPACEX"],
    },
    ferrari: {
      headline: "O que Enzo escondeu sobre o acordo com a Ford",
      record: "Enzo Ferrari — fundador. Quase vendeu a Ferrari para a Ford em 1963.",
      real: "Ele saiu por uma cláusula sobre controle das corridas. A fúria da Ford financiou o programa GT40 — e o mito Ferrari ficou mais forte.",
      tags: ["EGO", "CORRIDAS", "LEGADO"],
    },
    default: {
      headline: "O que as atas da diretoria nunca disseram",
      record: "A história oficial — polida para investidores e imprensa.",
      real: "As decisões reais aconteciam em ligações noturnas, decks vazados e apostas que ninguém queria registrar.",
      tags: ["ESTRATÉGIA", "PODER", "VERDADE"],
    },
  },
  stat: { text: "dos leitores dizem entender melhor uma história de negócios após um capítulo Toonlora." },
  profile: {
    title: "Seu perfil",
    interestMap: "Seu mapa de interesses",
    stats: { sagas: "histórias de negócios", perChapter: "por capítulo", match: "match", categories: "categorias desbloqueadas" },
  },
  archetypes: {
    founder_stories: {
      title: "O olhar do construtor",
      description: "Você se sente atraído por obsessão, ego e decisões que transformam fundadores em lendas — ou alertas.",
      traits: ["Estratégia", "Obsessão", "Risco", "Visão", "Legado", "Pressão"],
    },
    rise_and_fall: {
      title: "O observador da queda",
      description: "Você quer a subida e o crash — arrogância, negação e o momento em que tudo quebra.",
      traits: ["Arrogância", "Poder", "Negação", "Colapso", "Lições", "Drama"],
    },
    empires: {
      title: "O arquiteto de impérios",
      description: "Você quer saber como marcas escalam, dominam categorias e defendem vantagens por décadas.",
      traits: ["Escala", "Marca", "Vantagens", "Cultura", "Domínio", "Operações"],
    },
    heists_and_frauds: {
      title: "O detetive de negócios",
      description: "Você se interessa por fraude, alavancagem e quem dobrou as regras até o sistema quebrar.",
      traits: ["Fraude", "Alavancagem", "Segredos", "Poder", "Ganância", "Justiça"],
    },
    default: {
      title: "O leitor estratégico",
      description: "Você quer a história real por trás de movimentos bilionários — não a versão do comunicado à imprensa.",
      traits: ["Estratégia", "Finanças", "Liderança", "Risco", "Mercados", "Verdade"],
    },
  },
  journey: {
    badge: "Personalizado para você",
    title: "Em 30 dias você conhecerá as histórias que os manchetes ignoram",
    subtitle: "Com base no que você escolheu, este é o seu caminho.",
    weeks: [
      { label: "Agora", title: "Sua lista está pronta" },
      { label: "Semana 1–2", title: "Sagas de fundadores e análises" },
      { label: "Semana 3–4", title: "Ascensões, quedas e fraudes" },
      { label: "Mês 1", title: "Biblioteca completa desbloqueada", crown: true },
    ],
  },
  loading: {
    headline: "Personalizando sua lista de negócios",
    title: "Criando seu plano personalizado",
    tasks: {
      "0": "Analisando suas respostas",
      "1": "Combinando categorias e tom",
      "2": "Encontrando histórias para você",
      "3": "Ordenando sua lista",
      "4": "Calibrando o ritmo dos capítulos",
      "5": "Criando seu plano personalizado",
    },
  },
  checkout: { readStoriesLike: "Leia histórias como:", trustedByReaders: "Confiado por leitores" },
  reviews: {
    "0": { timeAgo: "há 2 dias", title: "Amo este app!", body: "Achava que sabia tudo sobre Steve Jobs. A luta para voltar à Apple foi muito mais brutal que em qualquer documentário — e os painéis batem mais forte." },
    "1": { timeAgo: "há 1 semana", title: "A forma perfeita de relaxar após um dia caótico", body: "As histórias de fundadores te puxam para outro mundo. Afiadas, cinematográficas e surpreendentemente emocionantes. Cada capítulo deixa vontade de mais um — sem podcast de três horas." },
    "2": { timeAgo: "há 3 dias", title: "Baixei esperando uma leitura rápida", body: "Esperava uma fuga rápida, mas fiquei viciado na saga da FTX quase imediatamente. Parece Succession, mas com balanços reais e apostas muito maiores." },
  },
};

const lp4 = {
  es: {
    intro: {
      headline: "Las historias de negocios que nunca pusieron en los libros de texto",
      subtitle: "Responde unas preguntas y descubre las historias de negocios más profundas del mundo.",
    },
  },
  fr: {
    intro: {
      headline: "Les histoires business qu'on ne met jamais dans les manuels",
      subtitle: "Répondez à quelques questions et découvrez les histoires business les plus approfondies au monde.",
    },
  },
  pt: {
    intro: {
      headline: "As histórias de negócios que nunca entraram nos livros",
      subtitle: "Responda algumas perguntas e descubra as histórias de negócios mais profundas do mundo.",
    },
  },
};

for (const [locale, lp3] of [
  ["es", es],
  ["fr", fr],
  ["pt", pt],
]) {
  const file = path.join(root, "locales", `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  data.lp3 = lp3;
  data.lp4 = lp4[locale];
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated locales/${locale}.json`);
}
