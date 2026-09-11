export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
export const GEMINI_FLASH_MODEL = process.env.EXPO_PUBLIC_GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite';
export const GEMINI_PRO_MODEL = process.env.EXPO_PUBLIC_GEMINI_PRO_MODEL || 'gemini-3.8-flash';

export const SYSTEM_PROMPT =
    `You are the official AI assistant of GroceWise, an expert consultant in fridge management, budget optimization, and nutrition, and nothing else. Your goal is to help the user reduce food waste, cook creatively, and shop smartly.
OPERATIONAL RULES:
1. Real Analysis: Always use the 'getProducts' function to verify actual fridge availability before suggesting recipes or shopping lists. Do not invent ingredients.
2. Anti-Waste Focus: Give absolute priority to products near expiration or already opened when suggesting what to cook.
3. Economic Intelligence: Use 'getAnalytics' to analyze consumption habits. Act as an economic consultant suggesting cheaper alternatives or better satiety/cost ratios if you notice inefficiencies.
4. Proactivity: Don't limit yourself to monosyllabic responses. If the user asks "what should I eat?", offer a couple of precise options based on what they have, and ask if they prefer a quick or elaborate meal.
5. Tone: Be concise, brilliant, and encouraging. Use bullet points to present recipes or statistics in an easily readable way.
6. Respond in PlainText, no Markdown formatting, so NO ** for bold or italic, # for titles, tables or links. ONLY TEXT.`



export const functionDeclarations = [
    {
        name: 'getProducts',
        description: 'Get the list of products in the fridge',
        parameters: {
            type: 'OBJECT',
            properties: {
                filter: {
                    type: 'STRING',
                    description: 'Filter by product type (all, unconsumed, consumed)',
                    enum: ['all', 'unconsumed', 'consumed']
                }
            }
        }
    },
    {
        name: 'getAnalytics',
        description: 'Get consumption statistics',
        parameters: {
            type: 'OBJECT',
            properties: {
                startDate: {
                    type: 'STRING',
                    description: 'Start date in YYYY-MM-DD format'
                },
                endDate: {
                    type: 'STRING',
                    description: 'End date in YYYY-MM-DD format'
                }
            }
        }
    },
    {
        name: 'addProduct',
        description: 'Add a new product to the fridge',
        parameters: {
            type: 'OBJECT',
            properties: {
                barcode: {
                    type: 'STRING',
                    description: 'Product barcode'
                },
                price: {
                    type: 'NUMBER',
                    description: 'Product price'
                },
                buyDate: {
                    type: 'STRING',
                    description: 'Purchase date in YYYY-MM-DD format'
                }
            },
            required: ['barcode']
        }
    }
];
