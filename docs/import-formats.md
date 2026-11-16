# Importazione di programmazioni — proposta v1

Stato: specifica di progetto. La demo attuale carica e visualizza allegati; non implementa ancora l'importazione strutturata.

## Obiettivo

Da un modello concordato il preparatore carica il file; l'app riconosce sessioni, esercizi, serie, ripetizioni, tempi e recuperi. Mostra un'anteprima modificabile e segnala errori per riga. Solo dopo conferma assegna il programma all'atleta, conservando anche il documento originale.

Un PDF visualizzabile non equivale automaticamente a una scheda strutturata. Gli esercizi a ripetizioni hanno un timer per il recupero; un timer di lavoro si ricava solo da una durata esplicita, non dal numero di ripetizioni.

## Formati

| Formato | Strategia proposta | Limiti |
| --- | --- | --- |
| XLSX | Foglio `Esercizi`, intestazioni v1, una riga per esercizio | Leggere valori, senza eseguire macro o formule; date e unità esplicite. |
| CSV / TSV | Stesse colonne, delimitatore noto e UTF-8 | Semplice da validare e modificare anche in Excel. |
| TXT | TSV con intestazione, non testo libero | Lo spazio o l'allineamento visivo non separano in modo affidabile i campi. |
| JSON | Oggetto con versione, metadati, sessioni ed esercizi | Il più adatto a scambi tra sistemi e backup. |
| PDF con testo | Estrarre un layout fisso e versionato, preferibilmente un modulo compilabile con campi nominati | Ordine di lettura, tabelle e impaginazione possono variare. Conferma umana obbligatoria prima dell'assegnazione. |
| PDF scansionato / JPG / PNG | OCR e riconoscimento, con revisione | Errori possibili su nomi, carichi, tempi e ripetizioni; non adatto come prima integrazione affidabile. |
| DOCX | Tabelle con intestazioni v1 | Supportabile in una fase successiva; il testo libero richiede interpretazione. |

Priorità consigliata: CSV/TSV e XLSX, poi JSON e TXT strutturato; PDF solo con modello concordato. Non serve necessariamente AI per i formati strutturati.

## Colonne tabellari v1

| Campo | Tipo | Regola |
| --- | --- | --- |
| `schema_version` | intero | `1`, obbligatorio |
| `program_name` | testo | Nome della programmazione, obbligatorio |
| `session_id` | testo | Es. `A`, obbligatorio |
| `session_name` | testo | Es. `Full body`, obbligatorio |
| `exercise_order` | intero | Da 1 in avanti, univoco all'interno della sessione |
| `exercise_name` | testo | Obbligatorio |
| `sets` | intero | Almeno 1 |
| `reps` | intero opzionale | Ripetizioni per serie; positivo se presente |
| `work_seconds` | intero opzionale | Durata di lavoro per serie; positiva se presente |
| `rest_seconds` | intero | Secondi di recupero, almeno 0 |
| `load_kg` | numero opzionale | Carico previsto; almeno 0, punto decimale |
| `notes` | testo opzionale | Indicazioni del preparatore |

Ogni esercizio deve avere almeno `reps` o `work_seconds`. Nessuna conversione implicita tra minuti e secondi. I carichi vanno distinti dai risultati effettivamente registrati dall'atleta. `session_id` è un identificatore locale alla scheda: il cliente a cui assegnarla viene scelto nell'app, senza fidarsi di un nome contenuto nel file.

## Flusso di importazione previsto

1. Controllare tipo, dimensione e versione del file.
2. Estrarre i dati senza eseguire contenuto attivo.
3. Normalizzare le unità e validare tutti i campi; segnalare valori mancanti, duplicati e incoerenti.
4. Mostrare anteprima di programma, sessioni, esercizi e timer al preparatore.
5. Confermare l'atleta e salvare una nuova versione della scheda; non sovrascrivere automaticamente una versione esistente.
6. L'atleta consulta la scheda e registra i dati effettivi senza modificare la prescrizione originale.

Per l'uso multiutente servono autenticazione, autorizzazioni preparatore/atleta, un archivio documenti e un database per le schede strutturate. L'analisi CSV/TXT/JSON può essere effettuata localmente nel browser; la sincronizzazione richiede un backend.

## Esempi

`templates/program-v1.csv`, `templates/program-v1.txt` (TSV) e `templates/program-v1.json` descrivono lo stesso programma. Sono campioni per validare il futuro importatore, non file già importabili dalla demo.
