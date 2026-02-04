import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import LanguageToggle from '@/components/common/LanguageToggle';

export default function About() {
  const [lang, setLang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('waypoint_lang', lang);
  }, [lang]);

  const text = {
    en: {
      title: "About Waypoint Institute",
      mission_title: "Mission",
      mission_text: "Guided by the Great Commission (Matthew 28:18–20), we go and make disciples of all nations through accessible, serious Christian learning.",
      ethos_title: "Ethos",
      ethos_items: [
        {
          title: "Christocentrism",
          desc: "Jesus is the center of history, our thinking, and every decision we make.",
          icon: Cross
        },
        {
          title: "Biblical & Useful",
          desc: "We pursue truth wherever it is honorable, excellent, and expedient for discipleship.",
          icon: BookOpen
        },
        {
          title: "Accessibility",
          desc: "We dismantle barriers—academic, cultural, or technological—so learners can encounter Christ together.",
          icon: Globe
        }
      ],
      faith_title: "Statement of Faith",
      creed_title: "The Apostles' Creed",
      creed: [
        "I believe in God, the Father Almighty, Creator of heaven and earth.",
        "I believe in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried; He descended to the dead. On the third day He rose again; He ascended into heaven, He is seated at the right hand of the Father, and He will come to judge the living and the dead.",
        "I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and the life everlasting. Amen."
      ],
      who_we_serve: "Who We Serve",
      who_items: [
        "Christians and seekers worldwide who need serious formation without cost.",
        "Students in a variety of languages and contexts who benefit from self-paced weeks with shared milestones.",
        "Lay leaders and bi-vocational ministers seeking structured study alongside ministry life."
      ]
    },
    es: {
      title: "Acerca de Waypoint Institute",
      mission_title: "Misión",
      mission_text: "Guiados por la Gran Comisión (Mateo 28:18–20), vamos y hacemos discípulos de todas las naciones a través del aprendizaje cristiano accesible y serio.",
      ethos_title: "Ethos",
      ethos_items: [
        {
          title: "Cristocentrismo",
          desc: "Jesús es el centro de la historia, nuestro pensamiento y cada decisión que tomamos.",
          icon: Cross
        },
        {
          title: "Bíblico y Útil",
          desc: "Perseguimos la verdad dondequiera que sea honorable, excelente y conveniente para el discipulado.",
          icon: BookOpen
        },
        {
          title: "Accesibilidad",
          desc: "Desmontamos barreras—académicas, culturales o tecnológicas—para que los estudiantes puedan encontrar a Cristo juntos.",
          icon: Globe
        }
      ],
      faith_title: "Declaración de Fe",
      creed_title: "El Credo de los Apóstoles",
      creed: [
        "Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra.",
        "Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de Santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos.",
        "Creo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén."
      ],
      who_we_serve: "A Quién Servimos",
      who_items: [
        "Cristianos y buscadores de todo el mundo que necesitan formación seria sin costo.",
        "Estudiantes en diversos idiomas y contextos que se benefician de semanas a su propio ritmo con hitos compartidos.",
        "Líderes laicos y ministros bivocacionales que buscan estudio estructurado junto con la vida ministerial."
      ]
    }
  };

  const t = text[lang];

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69826d34529ac930f0c94f5a/f6dc8e0ae_waypoint-logo-transparent.png" 
              alt="Waypoint Institute" 
              className="h-12" 
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            <Link to={createPageUrl(`Pathways?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Programas' : 'Programs'}
            </Link>
            <Link to={createPageUrl(`About?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Acerca de' : 'About'}
            </Link>
            <Link to={createPageUrl(`Catalog?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Cursos' : 'Courses'}
            </Link>
            <Link to={createPageUrl(`HowItWorks?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Cómo Funciona' : 'How it works'}
            </Link>
            <Link to={createPageUrl(`Support?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Apoyar' : 'Support'}
            </Link>
            <Link to={createPageUrl(`FAQ?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              FAQ
            </Link>
            <Link to={createPageUrl(`Contact?lang=${lang}`)} className="text-slate-700 hover:text-[#1e3a5f] transition-colors font-medium">
              {lang === 'es' ? 'Contacto' : 'Contact'}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onToggle={setLang} />
            <Link to={createPageUrl(`Apply?lang=${lang}`)}>
              <Button size="sm" variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white hidden sm:inline-flex">
                {lang === 'es' ? 'Aplicar' : 'Apply'}
              </Button>
            </Link>
            <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-32">
        <h1 className="text-5xl font-semibold text-slate-900 mb-16 text-center">{t.title}</h1>

        {/* Mission */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-[#c4933f]" />
            <h2 className="text-3xl font-semibold text-slate-900">{t.mission_title}</h2>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed">{t.mission_text}</p>
        </div>

        {/* Ethos */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-slate-900 mb-8">{t.ethos_title}</h2>
          <div className="space-y-6">
            {t.ethos_items.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-[#1e3a5f]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Faith */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-slate-900 mb-8">{t.faith_title}</h2>
          <Card className="bg-slate-50 border-2">
            <CardContent className="p-8">
              <h3 className="text-xl font-serif italic text-[#1e3a5f] mb-6">{t.creed_title}</h3>
              <div className="space-y-4">
                {t.creed.map((line, i) => (
                  <p key={i} className="text-slate-700 leading-relaxed">{line}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Who We Serve */}
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 mb-8">{t.who_we_serve}</h2>
          <div className="space-y-4">
            {t.who_items.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#c4933f] mt-2 flex-shrink-0" />
                <p className="text-lg text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}