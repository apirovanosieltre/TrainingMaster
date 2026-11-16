# Ruoli e calendario — demo

La demo distingue i ruoli tramite il selettore della vista. Non esistono ancora autenticazione applicativa, API di autorizzazione o sincronizzazione tra dispositivi. La protezione di accesso al Site è distinta dai ruoli preparatore/atleta nell'app.

| Operazione | Preparatore | Atleta |
| --- | --- | --- |
| Caricare e assegnare file | Sì | No |
| Consultare schede e guide | Sì | Sì, quelle assegnate al profilo dimostrativo |
| Registrare risultati nel diario dell'atleta | No | Sì |
| Consultare i dati degli atleti | Sì | Solo il proprio profilo dimostrativo |
| Pubblicare o rimuovere disponibilità | Sì | No |
| Prenotare gli slot liberi | No | Sì |
| Annullare appuntamenti | Sì | I propri |

I comandi e i relativi gestori verificano il ruolo attivo per evitare azioni involontarie nella vista sbagliata. Il JavaScript e l'archivio locale rimangono modificabili dal browser: questi controlli non sostituiscono autorizzazioni lato server.

## Disponibilità

- Fuso orario Europe/Rome, calendario con settimana da lunedì.
- Una fascia in un giorno viene divisa secondo la durata del servizio: personal training 60 minuti, check-up 45 minuti, consulenza 30 minuti.
- Si pubblicano solo slot completi tra le 06:00 e le 22:00. Minuti residui non sufficienti per una sessione sono esclusi e indicati nel messaggio finale.
- Il sistema rifiuta date o orari passati e sovrapposizioni, anche tra servizi o modalità diversi: è previsto un unico preparatore, con capienza di una persona per slot.
- Un appuntamento occupato non può essere rimosso come semplice disponibilità. Va annullato esplicitamente.

## Prenotazione e annullamento

L'atleta sceglie un giorno e un orario pubblicato; non propone un orario arbitrario. La conferma crea un appuntamento e occupa lo slot. Prima della scrittura viene riletto l'archivio locale per controllare che lo slot sia ancora libero. Le richieste della vecchia demo sono conservate in una sezione separata e non occupano automaticamente orari del nuovo calendario.

L'annullamento dell'atleta riapre lo slot. L'annullamento del preparatore chiude anche la disponibilità, evitando nuove prenotazioni su quell'orario. Lo storico degli annullamenti rimane visibile. La home ricava il prossimo appuntamento dalle prenotazioni future confermate.

## Persistenza e passaggio in produzione

Il calendario viene salvato nella chiave `forma-agenda-v1` del localStorage, separata da diario e file. Alla prima apertura vengono creati orari dimostrativi nei successivi sette giorni; non vengono inventate prenotazioni confermate. La modifica in un'altra scheda dello stesso browser aggiorna la vista tramite l'evento `storage`.

Non è una prenotazione reale e non invia notifiche. Per più utenti occorrono API autenticate, ruoli verificati dal server, database condiviso e vincoli transazionali sulla capienza. La rilettura locale non è una garanzia contro prenotazioni simultanee da dispositivi diversi, né una transazione tra schede concorrenti.

## Verifiche

Test di creazione fasce, intervalli sovrapposti o invalidi, doppia prenotazione, annullamento per ruolo, archivio aggiornato e cambio data in Europe/Rome. Verifica UI mobile del flusso atleta e preparatore, inclusi messaggio di sovrapposizione e annullamento.
