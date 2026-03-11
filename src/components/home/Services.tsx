"use client";

import {
  GraduationCap,
  Laptop,
  ShieldCheck,
  Heart,
  Wind,
  Smile,
  Baby,
  Compass,
  Users,
} from "lucide-react";

const services = [
  {
    title: "Talleres Psicoeducativos",
    desc: "Espacios de aprendizaje interactivo para desarrollar habilidades emocionales y de afrontamiento diario.",
    icon: <GraduationCap className="w-6 h-6 text-white" />,
  },
  {
    title: "Acompañamiento Online",
    desc: "Terapia psicológica remota para cuidar tu salud mental desde cualquier lugar con total privacidad.",
    icon: <Laptop className="w-6 h-6 text-white" />,
  },
  {
    title: "Prevención y Promoción",
    desc: "Desarrollo de programas orientados a promover la salud mental y prevenir el deterioro emocional.",
    icon: <ShieldCheck className="w-6 h-6 text-white" />,
  },
  {
    title: "Terapia de Pareja",
    desc: "Orientación especializada para resolver crisis, mejorar la comunicación y reconectar efectivamente.",
    icon: <Heart className="w-6 h-6 text-white" />,
  },
  {
    title: "Duelo y Pérdida",
    desc: "Acompañamiento compasivo para transitar de forma sana situaciones de pérdida y promover la aceptación.",
    icon: <Wind className="w-6 h-6 text-white" />,
  },
  {
    title: "Terapia de Autoestima",
    desc: "Procesos para fortalecer el amor propio, el autoconocimiento y sanar la autoimagen personal.",
    icon: <Smile className="w-6 h-6 text-white" />,
  },
  {
    title: "Niños y Familia",
    desc: "Intervenciones enfocadas en dinámicas familiares sanas, pautas de crianza y el bienestar infantil.",
    icon: <Baby className="w-6 h-6 text-white" />,
  },
  {
    title: "Planificación del Futuro",
    desc: "Asesoramiento vocacional y vital para ayudar a tomar decisiones y gestionar el cambio de manera asertiva.",
    icon: <Compass className="w-6 h-6 text-white" />,
  },
  {
    title: "Adultos Mayores",
    desc: "Atención psicológica sobre los desafíos emocionales de la madurez promoviendo un envejecimiento activo.",
    icon: <Users className="w-6 h-6 text-white" />,
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-[#2b2b2b] pt-20 pb-40 relative">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="max-w-[700px] mb-16 relative z-10">
          {/* Subtitle */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1.5">
              <span className="w-[6px] h-[6px] rounded-full bg-white/50" />
              <span className="w-[30px] h-[1.5px] bg-white/50" />
            </div>
            <span className="text-[13px] font-bold text-white/70 uppercase tracking-[.2em]">
              ÁREAS DE ATENCIÓN
            </span>
          </div>

          <h2 className="text-white text-[36px] lg:text-[44px] font-bold leading-[1.12] mb-6">
            Servicios profesionales para tu crecimiento personal.
          </h2>
          <p className="text-white/50 text-[1.3rem] leading-[1.8]">
            Ofrecemos espacios de apoyo terapéutico y psicoeducativo diseñados
            para responder a tus verdaderas necesidades emocionales en cada
            etapa de la vida.
          </p>
        </div>

        {/* 9 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14 relative z-10">
          {services.map((svc, i) => (
            <div key={i} className="group">
              {/* Icon Circle */}
              <div className="w-[52px] h-[52px] rounded-full bg-[#3a3a3a] group-hover:bg-[#8A6046] flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 shadow-lg">
                {svc.icon}
              </div>
              <h3 className="text-white text-[24px] font-black mb-3 group-hover:text-[#e0d3c3] transition-colors">
                {svc.title}
              </h3>
              <p className="text-white/50 text-[1.2rem] md:text-[1.3rem] leading-[1.6]">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
