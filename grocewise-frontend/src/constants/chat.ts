export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
export const GEMINI_FLASH_MODEL = process.env.EXPO_PUBLIC_GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite';
export const GEMINI_PRO_MODEL = process.env.EXPO_PUBLIC_GEMINI_PRO_MODEL || 'gemini-3.8-flash';

export const SYSTEM_PROMPT =
    `Sei l'assistente AI ufficiale di GroceWise, un consulente esperto nella gestione del frigorifero, nell'ottimizzazione del budget e nella nutrizione e di nient'altro. Il tuo obiettivo è aiutare l'utente a ridurre gli sprechi alimentari, cucinare in modo creativo e fare spese intelligenti.
REGOLE OPERATIVE:
1. Analisi Reale: Usa sempre la funzione 'getProducts' per verificare l'effettiva disponibilità nel frigo prima di suggerire ricette o liste della spesa. Non inventare ingredienti.
2. Focus Anti-Spreco: Dai priorità assoluta ai prodotti vicini alla scadenza o già aperti quando suggerisci cosa cucinare.
3. Intelligenza Economica: Sfrutta 'getAnalytics' per analizzare le abitudini di consumo. Agisci come consulente economico suggerendo alternative più economiche o con un miglior rapporto sazietà/costo se noti inefficienze.
4. Proattività: Non limitarti a rispondere a monosillabi. Se l'utente chiede "cosa mangio?", offri un paio di opzioni precise basate su ciò che ha, e chiedi se preferisce un pasto veloce o elaborato.
5. Tono: Sii conciso, brillante e incoraggiante. Usa elenchi puntati per presentare ricette o statistiche in modo facilmente leggibile.
6. Rispondi in PlainText, no formattazioni Markdown, quindi NO  ** per il grassetto o corsivo, # per i titoli, tabelle o link. SOLO TESTO.`



export const functionDeclarations = [
    {
        name: 'getProducts',
        description: 'Ottieni la lista dei prodotti nel frigo',
        parameters: {
            type: 'OBJECT',
            properties: {
                filter: {
                    type: 'STRING',
                    description: 'Filtro per tipo di prodotti (all, unconsumed, consumed)',
                    enum: ['all', 'unconsumed', 'consumed']
                }
            }
        }
    },
    {
        name: 'getAnalytics',
        description: 'Ottieni le statistiche di consumo',
        parameters: {
            type: 'OBJECT',
            properties: {
                startDate: {
                    type: 'STRING',
                    description: 'Data di inizio nel formato YYYY-MM-DD'
                },
                endDate: {
                    type: 'STRING',
                    description: 'Data di fine nel formato YYYY-MM-DD'
                }
            }
        }
    },
    {
        name: 'addProduct',
        description: 'Aggiungi un nuovo prodotto al frigo',
        parameters: {
            type: 'OBJECT',
            properties: {
                barcode: {
                    type: 'STRING',
                    description: 'Codice a barre del prodotto'
                },
                price: {
                    type: 'NUMBER',
                    description: 'Prezzo del prodotto'
                },
                buyDate: {
                    type: 'STRING',
                    description: 'Data di acquisto nel formato YYYY-MM-DD'
                }
            },
            required: ['barcode']
        }
    }
];
