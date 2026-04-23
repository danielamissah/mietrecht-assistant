import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { LetterInput } from '@/types';
import { validateServerEnv } from '@/lib/validateEnv';

export async function POST(req: NextRequest) {
  // Validate required env vars before doing anything else
  try {
    validateServerEnv();
  } catch (e: any) {
    console.error(e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

// Dispute-specific system prompts.
// Each instructs the model to act as a Mieterverein legal advisor
// and produce letters citing the correct BGB paragraphs.
// Temperature 0.3 keeps legal citations consistent across generations.
const DISPUTE_PROMPTS: Record<string, string> = {
  mietpreisbremse: `You are a legal advisor at a German Mieterverein.
Write a formal Rüge letter invoking the Mietpreisbremse under §556d BGB.
The letter must:
- State that the tenant formally invokes their right under §556d BGB
- Request the landlord provide proof of the Ausgangsmiete and any Modernisierungsmaßnahmen
- Set a written response deadline of 30 days
- Use formal German legal register throughout
- Include Betreff, formal Anrede, structured body, and Hochachtungsvoll closing`,

  deposit: `You are a legal advisor at a German Mieterverein.
Write a formal letter disputing an unlawful Kautionsabzug under §548 and §551 BGB.
The letter must:
- Reference §548 BGB (limitation period for landlord claims)
- Reference §551 BGB (maximum deposit of 3 cold months rent)
- Demand itemised written justification for each deduction within 14 days
- State that unjustified deductions will be pursued through legal channels
- Use formal German legal register throughout`,

  repair: `You are a legal advisor at a German Mieterverein.
Write a formal Mängelanzeige under §535 BGB.
The letter must:
- Formally notify the landlord of the specific defect in writing
- Set a Frist of 14 days for repair
- State that if unresolved the tenant reserves the right to Mietminderung under §536 BGB
- Reference the landlord maintenance duty under §535 Abs. 1 Satz 2 BGB
- Use formal German legal register throughout`,

  nebenkosten: `You are a legal advisor at a German Mieterverein.
Write a formal letter disputing a Betriebskostenabrechnung under §556 BGB.
The letter must:
- Reference §556 BGB and the BetrKV
- Request Belegeinsicht within 30 days
- Note the tenants 12-month right to dispute from date of receipt
- Flag disallowable cost categories under §2 BetrKV if mentioned
- Use formal German legal register throughout`,

  kundigung: `You are a legal advisor at a German Mieterverein.
Write a formal Widerspruch challenging a Kündigung under §574 BGB.
The letter must:
- Formally object under §574 BGB Sozialklausel
- Request detailed Eigenbedarf justification under §573 BGB
- State clearly that the tenant does not accept the Kündigung as legally valid
- Demand written confirmation of receipt
- Use formal German legal register throughout`,
};

function buildUserPrompt(input: LetterInput, language: 'de' | 'en'): string {
  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const base = `
Tenant: ${input.tenantName}
Tenant address: ${input.tenantAddress || 'not provided'}
Landlord: ${input.landlordName}
Landlord address: ${input.landlordAddress || 'not provided'}
Rental property: ${input.rentalAddress || 'not provided'}
Move-in date: ${input.moveInDate || 'not provided'}
Current monthly rent: ${input.currentRent ? `€${input.currentRent}` : 'not provided'}
Situation: ${input.details}
Today's date: ${today}`;

  if (language === 'de') {
    return `Generate the letter with these details:
${base}

Write a complete professional letter in formal German. Include:
- Date and city top right
- Sender address block top left
- Recipient address block
- Betreff bold subject line
- Anrede formal using landlord name if provided
- Body with correct legal citations
- Fristsetzung where appropriate
- Closing Hochachtungsvoll
- Signature line with tenant name`;
  }

  return `Generate an English translation and explanation of the following German legal letter.
${base}

Write a clear English version that:
- Maintains the same formal legal structure
- Translates all German legal terms with brief explanations in parentheses
- Keeps all BGB paragraph references
- Uses British English formal letter format
- Adds a note at the top: "ENGLISH VERSION - For reference only. Send the German version to your landlord."`;
}

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables');
    return NextResponse.json(
      { error: 'Server configuration error: API key missing' },
      { status: 500 }
    );
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  let input: LetterInput;
  try {
    input = await req.json();
  } catch (e) {
    console.error('Failed to parse request body:', e);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const systemPrompt = DISPUTE_PROMPTS[input.disputeType];
  if (!systemPrompt) {
    return NextResponse.json({ error: 'Invalid dispute type' }, { status: 400 });
  }

  try {
    console.log('Generating both DE and EN letters for dispute type:', input.disputeType);

    // Generate both letters in parallel — faster than sequential calls
    const [deResponse, enResponse] = await Promise.all([
      groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: buildUserPrompt(input, 'de') },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
      groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: buildUserPrompt(input, 'en') },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    ]);

    const letterDE = deResponse.choices[0]?.message?.content;
    const letterEN = enResponse.choices[0]?.message?.content;

    if (!letterDE || !letterEN) {
      console.error('Model returned empty content');
      return NextResponse.json(
        { error: 'Model returned an empty response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ letterDE, letterEN });

  } catch (error: any) {
    console.error('Groq API error:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid Groq API key. Check your .env.local file.' },
        { status: 500 }
      );
    }
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment and try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to generate letter. Please try again.' },
      { status: 500 }
    );
  }
}