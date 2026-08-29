import { Coffee, ShieldAlert, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type JournalSection = {
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  aside?: string;
};

export type JournalArticle = {
  slug: string;
  theme: "coffee" | "electric" | "weekend";
  category: string;
  title: string;
  intro: string;
  readTime: string;
  heroLine: string;
  opening: string;
  icon: LucideIcon;
  sections: JournalSection[];
  summaryTitle: string;
  summary: string[];
  alert?: {
    title: string;
    text: string;
  };
  sources: { label: string; href: string }[];
  next: { href: string; category: string; title: string };
};

export const coffeeArticle: JournalArticle = {
  slug: "cafe-et-dents",
  theme: "coffee",
  category: "Vrai ou faux ?",
  title: "Le café jaunit-il vraiment les dents ?",
  intro:
    "Oui, un peu. Mais votre espresso n’a pas besoin d’un avocat : il existe une grande différence entre colorer la surface et abîmer une dent.",
  readTime: "4 minutes",
  heroLine:
    "Le café plaide coupable de coloration de surface. Il conteste formellement l’accusation de sabotage général.",
  opening:
    "Il est 8 h 04. Le café est chaud, la journée peut commencer et votre sourire n’a encore déposé aucune plainte. Puis quelqu’un prononce la phrase qui gâche tout : « Tu sais que le café jaunit les dents ? » Respirez. Vous pouvez garder la tasse.",
  icon: Coffee,
  sections: [
    {
      number: "01",
      title: "Le suspect laisse surtout des traces",
      paragraphs: [
        "Le café contient des pigments qui peuvent s’accrocher à la pellicule naturelle recouvrant les dents, à la plaque et aux petites irrégularités de surface. À force, la teinte paraît plus chaude, surtout près des zones moins faciles à nettoyer.",
        "Il s’agit principalement de colorations externes. Votre dent ne se transforme donc pas mystérieusement en grain de moka après trois expressos. Elle collectionne plutôt de fines traces, tasse après tasse.",
      ],
      aside: "Le café ne travaille pas seul : le thé, le vin rouge et le tabac possèdent eux aussi une très belle collection de pigments.",
    },
    {
      number: "02",
      title: "Son meilleur complice : le temps",
      paragraphs: [
        "Un café bu en quelques minutes n’a pas la même vie sociale qu’une grande tasse promenée du bureau à la voiture jusqu’à midi. Plus les contacts sont fréquents et prolongés, plus les pigments ont l’occasion de s’installer.",
        "La plaque, le tartre, certaines restaurations vieillissantes ou une surface dentaire devenue plus rugueuse leur offrent également de très confortables points d’ancrage. Voilà pourquoi deux amateurs de café n’affichent pas forcément la même teinte.",
      ],
    },
    {
      number: "03",
      title: "Le plan anti-culpabilité",
      paragraphs: [
        "Bonne nouvelle : la prévention ne nécessite ni paille sophistiquée ni rupture douloureuse avec votre machine à café. Quelques habitudes simples suffisent à limiter les dépôts.",
      ],
      bullets: [
        "Buvez votre café avec plaisir, puis passez à autre chose plutôt que de le siroter pendant des heures.",
        "Un peu d’eau après la tasse remet simplement la bouche à zéro.",
        "Brossez deux fois par jour pendant deux minutes avec un dentifrice fluoré, sans tenter de rattraper chaque espresso par un décapage énergique.",
        "La maintenance professionnelle retire les dépôts que la brosse ne parvient plus à déloger.",
      ],
      aside: "La meilleure question n’est peut-être pas « Combien de cafés ? », mais « Mon café dure-t-il cinq minutes ou toute la matinée ? »",
    },
    {
      number: "04",
      title: "Et si je veux vraiment plus blanc ?",
      paragraphs: [
        "Un nettoyage professionnel enlève des colorations de surface ; un éclaircissement agit sur la teinte des dents naturelles. Ce ne sont pas les mêmes gestes, et les couronnes, facettes ou composites ne s’éclaircissent pas comme une dent.",
        "Avant de promettre un blanc de publicité pour dentifrice, il faut donc regarder l’ensemble du sourire : la teinte de départ, les restaurations visibles, les sensibilités et surtout le résultat naturel que vous recherchez.",
      ],
    },
  ],
  summaryTitle: "L’espresso en trois gorgées",
  summary: [
    "Oui, le café peut déposer des pigments en surface.",
    "Non, l’abandon immédiat de votre rituel n’est pas au programme.",
    "Une bonne hygiène et une maintenance régulière font l’essentiel du travail.",
  ],
  sources: [
    { label: "ADA — Éclaircissement et colorations", href: "https://www.ada.org/resources/ada-library/oral-health-topics/whitening" },
    { label: "ADA — Brosses à dents et bonnes habitudes", href: "https://www.ada.org/resources/ada-library/oral-health-topics/toothbrushes" },
  ],
  next: {
    href: "/journal/brosse-electrique/",
    category: "Mode d’emploi",
    title: "Brosse électrique : meilleure, vraiment ?",
  },
};

export const electricArticle: JournalArticle = {
  slug: "brosse-electrique",
  theme: "electric",
  category: "Mode d’emploi",
  title: "Brosse électrique : meilleure, vraiment ?",
  intro:
    "Souvent, oui. Mais elle possède un moteur, pas un diplôme d’hygiéniste. Il faut encore lui montrer où aller et lui laisser le temps de travailler.",
  readTime: "5 minutes",
  heroLine:
    "Elle vibre, chronomètre et parfois vous gronde. Malgré tout cela, elle refuse obstinément de se déplacer seule dans votre bouche.",
  opening:
    "À 7 h 12, la brosse électrique entre en scène avec le sérieux d’un appareil médical et le bruit d’une très petite tondeuse. Vous la posez sur une dent. Elle bourdonne. Vous vous dites qu’avec autant de technologie, le travail doit bien se faire tout seul. C’est précisément là que commence le malentendu.",
  icon: Zap,
  sections: [
    {
      number: "01",
      title: "Meilleure ? Souvent. Magique ? Jamais.",
      paragraphs: [
        "Utilisées correctement, les brosses manuelles comme électriques peuvent retirer efficacement la plaque et réduire l’inflammation des gencives. Les modèles électriques, notamment oscillants-rotatifs, obtiennent souvent un avantage modeste dans les études.",
        "Cet avantage vient surtout de leur régularité : le mouvement est produit pour vous, le minuteur évite le brossage-éclair et le capteur de pression peut calmer les utilisateurs qui confondent propreté et ponçage.",
      ],
      aside: "La brosse électrique compense une partie de nos défauts. Elle n’a pas encore trouvé comment compenser notre envie de terminer en quarante-sept secondes.",
    },
    {
      number: "02",
      title: "Le geste : poser, guider, patienter",
      paragraphs: [
        "Avec une petite tête électrique, inutile de reproduire les grands mouvements d’une brosse manuelle. Posez-la doucement, guidez-la dent par dent et laissez-lui une seconde pour nettoyer chaque surface.",
      ],
      bullets: [
        "Passez sur la face extérieure, la face intérieure puis la surface qui mastique.",
        "Suivez la ligne de la gencive sans l’écraser.",
        "Accordez-lui deux minutes, deux fois par jour, avec un dentifrice fluoré.",
        "Si le voyant de pression s’allume, ce n’est pas une médaille : relâchez la main.",
      ],
    },
    {
      number: "03",
      title: "Faut-il dix-sept modes et une application ?",
      paragraphs: [
        "Pour la majorité des bouches, trois qualités comptent davantage qu’un tableau de bord spatial : une tête confortable, un minuteur et un capteur de pression. Le meilleur modèle reste celui que vous utilisez correctement matin et soir.",
        "Le mode « blancheur intersidérale » peut être amusant. Il ne remplace ni une bonne technique, ni le nettoyage entre les dents, ni la surveillance des zones difficiles.",
      ],
      aside: "Une brosse à 300 francs utilisée au hasard reste une brosse utilisée au hasard. Une brosse simple bien guidée devient un excellent outil.",
    },
    {
      number: "04",
      title: "Ses angles morts",
      paragraphs: [
        "Même très enthousiaste, la tête ronde ne se téléporte pas entre les dents. Brossettes interdentaires ou fil restent donc utiles selon les espaces et les recommandations de votre praticien.",
        "Changez la tête lorsque les brins s’écartent ou s’usent — souvent autour de trois mois — et rincez-la après usage. Une tête en forme de petit palmier tropical n’est pas plus performante ; elle réclame sa retraite.",
      ],
    },
  ],
  summaryTitle: "Le mode d’emploi sans la notice de 84 pages",
  summary: [
    "Deux minutes, deux fois par jour, avec un dentifrice fluoré.",
    "Guidez doucement la tête ; ne frottez pas comme avec une brosse manuelle.",
    "Capteur de pression, minuteur et nettoyage interdentaire valent mieux qu’une collection de modes.",
  ],
  sources: [
    { label: "ADA — Soins bucco-dentaires à domicile", href: "https://www.ada.org/resources/ada-library/oral-health-topics/home-care" },
    { label: "ADA — Brosses à dents", href: "https://www.ada.org/resources/ada-library/oral-health-topics/toothbrushes" },
  ],
  next: {
    href: "/journal/casse-du-week-end/",
    category: "Les dents ont leur logique",
    title: "Pourquoi ça casse toujours le week-end",
  },
};

export const weekendArticle: JournalArticle = {
  slug: "casse-du-week-end",
  theme: "weekend",
  category: "Les dents ont leur logique",
  title: "Pourquoi ça casse toujours le week-end",
  intro:
    "Samedi, 19 h 08 : une amande vient de déposer sa candidature au poste d’instrument de diagnostic. La dent, elle, préparait souvent ce rebondissement depuis quelque temps.",
  readTime: "6 minutes",
  heroLine:
    "Non, les molaires ne consultent pas les horaires de la clinique. Elles ont simplement un sens du spectacle assez discutable.",
  opening:
    "Tout allait bien. Puis il y a eu ce petit « crac », immédiatement suivi d’un silence très concentré autour de la table. Vous explorez avec la langue. Quelque chose a changé. Bienvenue dans l’un des grands classiques du week-end, juste derrière la pluie pendant le barbecue.",
  icon: ShieldAlert,
  sections: [
    {
      number: "01",
      title: "L’amande est rarement seule responsable",
      paragraphs: [
        "Une dent peut être fragilisée par une grande restauration ancienne, une carie, une fissure, l’usure ou des contraintes répétées. Le dernier aliment n’est alors que l’événement qui rend la faiblesse visible.",
        "Voilà pourquoi la coupable officielle est parfois une mie de pain, un grain de riz ou un autre aliment parfaitement innocent. La dent avait déjà beaucoup travaillé ; elle choisit simplement un très mauvais moment pour remettre sa démission.",
      ],
      aside: "La phrase « Pourtant, je ne mangeais rien de dur » est parfaitement crédible. Une fragilité préexistante n’exige pas toujours une noisette de compétition.",
    },
    {
      number: "02",
      title: "D’abord : regarder sans bricoler",
      paragraphs: [
        "Rincez doucement la bouche à l’eau et essayez de retrouver le fragment. Conservez-le dans un petit récipient avec de l’eau et contactez un médecin-dentiste : certains fragments peuvent parfois être recollés.",
        "Évitez de mâcher du côté concerné. Si un bord coupe la langue, une cire orthodontique ou un matériau de protection conseillé en pharmacie peut dépanner. La colle forte, elle, doit rester très loin de la bouche, même si son emballage affiche une confiance impressionnante.",
      ],
      bullets: [
        "Gardez le fragment et ne le décapez pas.",
        "Appliquez du froid sur la joue en cas de choc ou de gonflement, jamais directement sur la dent.",
        "Pour un antidouleur, respectez la notice, vos contre-indications et les conseils de votre pharmacien ou médecin.",
        "Appelez la clinique ou écoutez son répondeur pour connaître la conduite à tenir hors horaires.",
      ],
    },
    {
      number: "03",
      title: "Quand le week-end devient vraiment urgent",
      paragraphs: [
        "Une dent permanente complètement expulsée, un traumatisme important, une douleur intense incontrôlable, un saignement abondant ou un gonflement qui progresse ne doivent pas attendre tranquillement lundi matin.",
        "Pour une dent permanente expulsée, saisissez-la uniquement par la couronne, jamais par la racine. Ne la laissez pas sécher : placez-la dans une boîte de sauvetage disponible en pharmacie ou, à défaut, dans du lait froid, puis consultez immédiatement.",
      ],
      aside: "Difficulté à respirer ou à avaler, gonflement du cou ou du visage, traumatisme facial majeur : appelez le 144.",
    },
    {
      number: "04",
      title: "Le détail suisse à ne pas oublier",
      paragraphs: [
        "Lorsqu’une dent casse à la suite d’un choc, même si le morceau est petit et la douleur modérée, déclarez l’accident à votre assurance-accidents. Certaines conséquences ne deviennent visibles que plus tard.",
        "Photographiez la situation, notez l’heure et les circonstances, puis gardez les documents du rendez-vous. Ce n’est pas très romanesque, mais votre futur dossier vous remerciera.",
      ],
    },
    {
      number: "05",
      title: "Peut-on éviter le prochain épisode ?",
      paragraphs: [
        "Une sensibilité à la mastication, une ancienne restauration très étendue, une fissure visible ou une dent qui change de sensation méritent d’être observées avant le prochain dîner du samedi.",
        "La maintenance, les images et le jumeau numérique permettent de suivre ces fragilités. On ne peut pas empêcher chaque casse, mais on peut souvent éviter qu’une dent silencieuse devienne soudain la vedette du week-end.",
      ],
    },
  ],
  summaryTitle: "Le pense-bête du samedi soir",
  summary: [
    "Gardez le fragment dans l’eau et contactez un médecin-dentiste.",
    "Ne collez rien vous-même et évitez de mâcher du côté concerné.",
    "Traumatisme, dent expulsée, douleur incontrôlable, saignement ou gonflement progressif : demandez une prise en charge urgente.",
  ],
  alert: {
    title: "Un doute sur le degré d’urgence ?",
    text: "Appelez la clinique au 032 724 40 20. Hors horaires, le répondeur vous indiquera la marche à suivre. En cas de difficulté respiratoire, de gonflement important du visage ou de traumatisme majeur, appelez le 144.",
  },
  sources: [
    { label: "SSO — Un accident dentaire est vite arrivé", href: "https://www.sso.ch/fr/un-accident-dentaire-est-vite-arrive" },
    { label: "NHS — Dent ébréchée, cassée ou fissurée", href: "https://www.nhs.uk/conditions/chipped-broken-or-cracked-tooth/" },
  ],
  next: {
    href: "/journal/cafe-et-dents/",
    category: "Vrai ou faux ?",
    title: "Le café jaunit-il vraiment les dents ?",
  },
};
