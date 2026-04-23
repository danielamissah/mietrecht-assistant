'use client';

import { useState } from 'react';
import { T } from '@/data/translations';

interface Props {
  t: T;
}

// Rights content in both languages, structured as Q&A pairs.
// Each category maps to a section of German tenancy law.
// Content reviewed against BGB as of 2025.
const RIGHTS_EN = [
  {
    category: 'Rent Increases',
    color: '#0D5C63',
    items: [
      {
        q: 'How much can my landlord increase my rent?',
        a: 'Your landlord can raise rent to a maximum of the local Vergleichsmiete (reference rent). In areas with a Mietspiegel, rent increases are capped at 20% over 3 years (Kappungsgrenze). In high-demand cities like Berlin, Hamburg, and Munich, this limit is 15% over 3 years.',
      },
      {
        q: 'How much notice do I get for a rent increase?',
        a: 'Your landlord must give you at least 3 months written notice. You then have 2 months to accept or refuse. If you refuse, the landlord must take you to court — they cannot simply raise the rent unilaterally.',
      },
      {
        q: 'Can my landlord increase rent after renovation?',
        a: 'Yes — a Modernisierungsmieterhöhung allows landlords to pass on 8% of modernisation costs per year. However, the increase cannot exceed €3/m² per month, or €2/m² if the rent was below €7/m² before modernisation.',
      },
    ],
  },
  {
    category: 'Deposit (Kaution)',
    color: '#C07A1A',
    items: [
      {
        q: 'What is the maximum deposit?',
        a: 'Under §551 BGB, the maximum deposit is 3 months cold rent (Kaltmiete). Any deposit exceeding this is illegal and must be refunded.',
      },
      {
        q: 'When must my deposit be returned?',
        a: 'Your landlord has up to 6 months after you move out to return the deposit, minus any legitimate deductions. All deductions must be itemised and justified in writing.',
      },
      {
        q: 'What can the landlord deduct from my deposit?',
        a: 'Landlords can only deduct for: unpaid rent, damage beyond normal wear and tear, and outstanding Nebenkosten. They cannot deduct for cosmetic repairs that were already overdue regardless of your tenancy — for example, repainting walls after 10+ years is the landlord\'s responsibility.',
      },
    ],
  },
  {
    category: 'Repairs and Defects',
    color: '#8E24AA',
    items: [
      {
        q: 'What is the landlord obligated to repair?',
        a: 'Under §535 BGB, the landlord must maintain the property in a condition suitable for the agreed use throughout the tenancy. This includes heating, plumbing, windows, the roof, and shared areas.',
      },
      {
        q: 'Can I reduce my rent if there is a defect?',
        a: 'Yes. Under §536 BGB, you can reduce your rent (Mietminderung) proportionally for any defect that significantly reduces the usability of the property. You must first notify the landlord formally in writing with a reasonable repair deadline.',
      },
      {
        q: 'What counts as a significant defect?',
        a: 'Courts have accepted these as grounds for Mietminderung: broken heating in winter (up to 100% reduction), mould (10–100% depending on extent), construction noise (10–30%), a non-functional lift in a high-rise building, and vermin infestation.',
      },
    ],
  },
  {
    category: 'Utility Bills (Nebenkosten)',
    color: '#1A73E8',
    items: [
      {
        q: 'How long do I have to dispute my Nebenkosten bill?',
        a: 'You have exactly 12 months from the date you received the Betriebskostenabrechnung to dispute it. After 12 months, you lose the right to object even if errors exist — this is a hard legal deadline.',
      },
      {
        q: 'What costs can be charged to tenants?',
        a: 'Only costs listed in §2 BetrKV can be charged. Allowable costs include: heating, water, building insurance, garden maintenance, caretaker (Hausmeister), and lift maintenance. Not allowed: property management fees, repair costs, and reserve funds (Reparaturrücklagen).',
      },
      {
        q: 'Can I inspect the original receipts?',
        a: 'Yes. Under §259 BGB you have the right to inspect (Belegeinsicht) all original invoices. Request this in writing — the landlord must provide access within a reasonable period. They are not required to send you copies, but must allow you to view the originals.',
      },
    ],
  },
  {
    category: 'Eviction and Notice',
    color: '#E53935',
    items: [
      {
        q: 'How much notice must my landlord give me?',
        a: 'Notice periods scale with tenancy length: up to 5 years → 3 months notice, 5–8 years → 6 months, over 8 years → 9 months. Your landlord can only terminate for one of three legal reasons: Eigenbedarf (personal use), serious breach of contract, or persistent non-payment of rent.',
      },
      {
        q: 'What is Eigenbedarf?',
        a: 'Eigenbedarf means the landlord or a direct family member genuinely needs the property for personal use. The need must be real and demonstrable. If the Eigenbedarf claim is later shown to be pretextual — for example, if the property is immediately re-let to a new tenant — you may claim damages.',
      },
      {
        q: 'Can I be evicted during winter?',
        a: 'There is no absolute winter eviction ban in Germany. However, courts can grant a temporary stay (Vollstreckungsschutz) based on hardship under §574 BGB (Sozialklausel), particularly for elderly tenants, families with young children, or people with serious illness.',
      },
    ],
  },
  {
    category: 'Mietpreisbremse',
    color: '#43A047',
    items: [
      {
        q: 'What is the Mietpreisbremse?',
        a: 'The Mietpreisbremse (rent brake) limits new rental contracts to a maximum of 10% above the local ortsübliche Vergleichsmiete. It applies in areas officially designated as having a tense housing market (angespannte Wohnungsmärkte) — currently in force in Berlin, Hamburg, Munich, Frankfurt, Cologne, and many other cities.',
      },
      {
        q: 'How do I invoke the Mietpreisbremse?',
        a: 'Send your landlord a formal written Rüge stating that you believe the rent exceeds the legal limit under §556d BGB. The landlord must then disclose the previous rent and any applicable exemptions within 18 months. Use our letter generator above to create this letter.',
      },
      {
        q: 'Are there exemptions?',
        a: 'Yes. The Mietpreisbremse does not apply to: new buildings first rented after 1 October 2014, apartments that were already rented above the limit before the law came into force (Bestandsschutz), and apartments that have undergone extensive modernisation costing more than one third of equivalent new construction costs.',
      },
    ],
  },
];

const RIGHTS_DE = [
  {
    category: 'Mieterhöhungen',
    color: '#0D5C63',
    items: [
      {
        q: 'Wie viel darf mein Vermieter die Miete erhöhen?',
        a: 'Der Vermieter darf die Miete maximal auf die ortsübliche Vergleichsmiete erhöhen. Die Kappungsgrenze begrenzt Erhöhungen auf 20 % innerhalb von 3 Jahren. In angespannten Märkten wie Berlin, Hamburg und München gilt eine Kappungsgrenze von 15 % in 3 Jahren.',
      },
      {
        q: 'Wie viel Vorlauf bekomme ich?',
        a: 'Der Vermieter muss mindestens 3 Monate vor Inkrafttreten schriftlich ankündigen. Du hast 2 Monate Zeit zur Zustimmung oder Ablehnung. Bei Ablehnung muss der Vermieter klagen — er kann die Miete nicht einfach erhöhen.',
      },
      {
        q: 'Kann der Vermieter nach Modernisierungen erhöhen?',
        a: 'Ja. Bei einer Modernisierungsmieterhöhung darf der Vermieter 8 % der Kosten jährlich umlegen. Die Erhöhung ist auf 3 €/m² pro Monat begrenzt, bzw. 2 €/m², wenn die Miete vorher unter 7 €/m² lag.',
      },
    ],
  },
  {
    category: 'Kaution',
    color: '#C07A1A',
    items: [
      {
        q: 'Wie hoch darf die Kaution maximal sein?',
        a: 'Gemäß § 551 BGB beträgt die Höchstgrenze 3 Kaltmonatsmieten. Eine höhere Kaution ist gesetzwidrig und muss zurückerstattet werden.',
      },
      {
        q: 'Wann muss die Kaution zurückgezahlt werden?',
        a: 'Der Vermieter hat bis zu 6 Monate nach Auszug Zeit. Alle Abzüge müssen schriftlich begründet und einzeln aufgeführt werden.',
      },
      {
        q: 'Was darf abgezogen werden?',
        a: 'Zulässig sind Abzüge für Mietrückstände, Schäden über normale Abnutzung hinaus und offene Nebenkosten. Nicht zulässig: Schönheitsreparaturen, die unabhängig von deinem Auszug ohnehin fällig gewesen wären.',
      },
    ],
  },
  {
    category: 'Mängel und Reparaturen',
    color: '#8E24AA',
    items: [
      {
        q: 'Was muss der Vermieter reparieren?',
        a: 'Gemäß § 535 BGB muss der Vermieter die Wohnung in einem zum vertragsgemäßen Gebrauch geeigneten Zustand erhalten. Dazu gehören Heizung, Sanitäranlagen, Fenster, Dach und Gemeinschaftsflächen.',
      },
      {
        q: 'Darf ich bei Mängeln die Miete mindern?',
        a: 'Ja. Gemäß § 536 BGB kannst du die Miete bei erheblichen Mängeln verhältnismäßig mindern. Zuvor musst du den Mangel schriftlich anzeigen und eine angemessene Frist zur Beseitigung setzen.',
      },
      {
        q: 'Was gilt als erheblicher Mangel?',
        a: 'Gerichte haben anerkannt: Heizungsausfall im Winter (bis 100 % Minderung), Schimmel (10–100 %), Baulärm (10–30 %), Aufzugsausfall im Hochhaus und Schädlingsbefall.',
      },
    ],
  },
  {
    category: 'Betriebskostenabrechnung',
    color: '#1A73E8',
    items: [
      {
        q: 'Wie lange habe ich Zeit zur Prüfung?',
        a: 'Du hast genau 12 Monate nach Erhalt der Abrechnung Zeit, Einwände zu erheben. Danach verfällt das Widerspruchsrecht — auch bei nachweisbaren Fehlern.',
      },
      {
        q: 'Welche Kosten dürfen umgelegt werden?',
        a: 'Nur Kosten aus § 2 BetrKV sind umlagefähig. Erlaubt: Heizung, Wasser, Gebäudeversicherung, Gartenpflege, Hausmeister, Aufzug. Nicht erlaubt: Verwaltungskosten, Reparaturen, Instandhaltungsrücklagen.',
      },
      {
        q: 'Habe ich Recht auf Belegeinsicht?',
        a: 'Ja. Gemäß § 259 BGB hast du das Recht, alle Originalbelege einzusehen. Fordere dies schriftlich an. Der Vermieter muss dir Zugang gewähren, ist aber nicht verpflichtet, Kopien zuzusenden.',
      },
    ],
  },
  {
    category: 'Kündigung',
    color: '#E53935',
    items: [
      {
        q: 'Welche Kündigungsfristen gelten?',
        a: 'Bis 5 Jahre Mietdauer → 3 Monate Frist, 5–8 Jahre → 6 Monate, über 8 Jahre → 9 Monate. Eine Kündigung ist nur aus bestimmten Gründen möglich: Eigenbedarf, schwerwiegende Vertragsverletzung oder Mietrückstand.',
      },
      {
        q: 'Was ist Eigenbedarf?',
        a: 'Eigenbedarf liegt vor, wenn der Vermieter oder ein naher Angehöriger die Wohnung selbst benötigt. Der Bedarf muss echt und nachweisbar sein. Bei vorgetäuschtem Eigenbedarf kann der Mieter Schadensersatz fordern.',
      },
      {
        q: 'Gibt es einen Kündigungsschutz im Winter?',
        a: 'Ein absolutes Winterkündigungsverbot gibt es nicht. Gerichte können jedoch eine Vollstreckung auf Grundlage der Sozialklausel (§ 574 BGB) aussetzen, besonders bei älteren Mietern, Familien mit Kindern oder schwerkranken Personen.',
      },
    ],
  },
  {
    category: 'Mietpreisbremse',
    color: '#43A047',
    items: [
      {
        q: 'Was ist die Mietpreisbremse?',
        a: 'Die Mietpreisbremse begrenzt Neumieten auf maximal 10 % über der ortsüblichen Vergleichsmiete. Sie gilt in Gebieten mit angespannten Wohnungsmärkten – aktuell u. a. in Berlin, Hamburg, München, Frankfurt und Köln.',
      },
      {
        q: 'Wie erhebe ich eine Rüge?',
        a: 'Sende deinem Vermieter eine schriftliche Rüge gemäß § 556d BGB. Der Vermieter muss innerhalb von 18 Monaten Auskunft über die Ausgangsmiete und etwaige Ausnahmen erteilen. Nutze unseren Brief-Generator dafür.',
      },
      {
        q: 'Gibt es Ausnahmen?',
        a: 'Ja. Die Mietpreisbremse gilt nicht für: Neubauten (Erstbezug nach dem 1. Oktober 2014), Wohnungen mit Bestandsschutz (vorher bereits über der Grenze vermietet) und umfassend modernisierte Wohnungen (Kosten über 1/3 der Neubaukosten).',
      },
    ],
  },
];

export function RightsGuide({ t }: Props) {
  const [openItem, setOpenItem] = useState<string | null>(null);

  // Switch between language datasets based on the toggle state
  const isDE = t.langToggle === 'EN';
  const rights = isDE ? RIGHTS_DE : RIGHTS_EN;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {rights.map((section) => (
        <div
          key={section.category}
          style={{
            background: 'white',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Category header — left border colour identifies the legal area */}
          <div
            style={{
              padding: '14px 18px',
              borderLeft: `4px solid ${section.color}`,
              background: '#FAFAFA',
            }}
          >
            <span
              style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}
            >
              {section.category}
            </span>
          </div>

          {/* Q&A accordion items */}
          {section.items.map((item, i) => {
            const id = `${section.category}-${i}`;
            const open = openItem === id;

            return (
              <div key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                <button
                  onClick={() => setOpenItem(open ? null : id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '13px 18px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '12px',
                    fontFamily: 'var(--font-open-sans)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.q}
                  </span>
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: open ? section.color : '#F3F4F6',
                      color: open ? 'white' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 700,
                      transition: 'background 0.15s',
                    }}
                  >
                    {open ? '−' : '+'}
                  </span>
                </button>

                {open && (
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#4B5563',
                      lineHeight: 1.75,
                      padding: '0 18px 14px',
                    }}
                  >
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}