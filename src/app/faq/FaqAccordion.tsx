// src/app/faq/FaqAccordion.tsx
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
    {
        question: "Quels sont les délais de livraison ?",
        answer: "Nous livrons généralement sous 2 à 5 jours ouvrables dans toute la Tunisie. Vous recevrez une notification d'expédition une fois votre commande partie de notre atelier."
    },
    {
        question: "Comment puis-je retourner un article ?",
        answer: "Vous disposez de 7 jours pour retourner un article qui ne vous convient pas, à condition qu'il soit dans son état d'origine. Veuillez consulter notre page 'Livraison & Retours' pour la procédure complète ou nous contacter directement."
    },
    {
        question: "Les couleurs des produits sont-elles fidèles aux photos ?",
        answer: "Nous nous efforçons de présenter les couleurs le plus fidèlement possible. Cependant, de légères variations peuvent exister en raison des réglages de votre écran. N'hésitez pas à nous contacter si vous avez un doute."
    },
    {
        question: "Comment puis-je vous contacter ?",
        answer: "Le moyen le plus rapide est via WhatsApp. Vous pouvez également nous envoyer un email ou nous appeler. Toutes nos coordonnées sont sur la page 'Contactez-nous'."
    },
    {
        question: "Proposez-vous des emballages cadeaux ?",
        answer: "Oui, nous pouvons préparer votre commande dans un emballage cadeau spécial. Veuillez le préciser dans les notes de votre commande ou nous contacter juste après avoir validé votre achat."
    }
];

export default function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqItems.map((item, index) => (
           <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left text-lg hover:text-primary">
                  {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                  {item.answer}
              </AccordionContent>
          </AccordionItem>
      ))}
    </Accordion>
  );
}
