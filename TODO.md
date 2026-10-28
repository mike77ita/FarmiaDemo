# TODO — Comparatore farmacie demo

## Prezzi per tutti e cinque i prodotti — Completato con copertura parziale
- [x] Inseriti 20 prezzi con link alle pagine dei venditori: 11 per Tachipirina 500 mg/20 compresse, 2 per Brufen Analgesico 200 mg/12 compresse, 3 per Moment 200 mg/12 compresse rivestite, 2 per Nurofen 200 mg/12 compresse rivestite e 2 per Voltaren Emulgel 1%/60 g. Prezzi e condizioni noti sono rilevati il 20/10/2026, non sono live.
- [x] Per le cinque confezioni sono stati aggiunti 85 candidati negozio/prodotto dalle liste Trovaprezzi consultate: 9 Tachipirina, 20 Brufen, 19 Moment, 18 Nurofen e 19 Voltaren. Nel catalogo risultano 58 negozi unici.
- [x] I candidati sono in sezioni espandibili, senza importare prezzo o spedizione da Trovaprezzi e senza includerli nel calcolo; per usarli l’utente deve inserire prezzo e disponibilità verificati sul venditore.
- [x] Esempi demo e candidati non entrano nell’ottimizzazione; i prezzi con disponibilità incerta sono esclusi.
- [ ] La ricerca non è un censimento esaustivo di tutte le farmacie online; le pagine consultate mostrano 20–25 righe ciascuna e l’inclusione su Trovaprezzi non conferma autorizzazione ministeriale.
- [ ] Aggiornare prezzi e scorte sulle pagine originali prima di presentarli come correnti; non è attivo alcun aggiornamento periodico.

## Spedizione e minimo d’ordine — Completato per 16 negozi con regole note
- [x] Inseriti costi standard, soglie gratuite e, dove rilevati, scaglioni; il minimo d’ordine è distinto dalla soglia di spedizione gratuita.
- [x] Il carrello somma prezzo × quantità e una spedizione per ogni farmacia usata; le soglie/scaglioni e il minimo d’ordine sono applicati al subtotale degli articoli accorpati in quell’ordine.
- [x] Per ogni farmacia l’utente può indicare minimo sconosciuto, nessun minimo o un importo; una policy sconosciuta o un importo non compilato esclude l’ordine dal calcolo.
- [x] Per i candidati senza tariffa verificata il costo resta sconosciuto, non viene assunto gratuito e il negozio non entra nel carrello finché le regole non sono completate.
- [ ] Riconfermare costi e soglie per destinazioni speciali, promozioni, metodi di pagamento e variazioni successive al 20/10/2026.

## Limite farmacie, ottimizzazione e risparmio — Completato
- [x] L’utente può scegliere una sola farmacia oppure un massimo di due; il motore rispetta il limite e minimizza prezzo prodotti × quantità più spedizioni.
- [x] Gli articoli assegnati alla stessa farmacia sono accorpati in un solo ordine; soglie e scaglioni gratuiti si calcolano sul subtotale combinato.
- [x] Il risparmio è confrontato con ordini separati per prodotto: per ciascun prodotto si sceglie il suo totale d’ordine singolo più basso, con prezzo × quantità, spedizione, soglia gratuita e minimo calcolati per quell’ordine.
- [x] Se il carrello è incompleto entro il limite, sono indicati copertura e prodotti mancanti; non viene mostrato un risparmio come se l’ordine fosse completo. Il benchmark separato è indicato come riferimento non confrontabile.
- [x] Sul campione verificato il limite di una farmacia copre 3/5 prodotti e il massimo di due ne copre 4/5; per Tachipirina manca un abbinamento completo con le offerte correntemente verificate.

## Interfaccia demo e verifiche — Completato
- [x] La lista iniziale contiene Tachipirina, Brufen Analgesico, Moment, Nurofen e Voltaren Emulgel; quantità modificabili e possibilità di inserire prodotti, offerte e farmacie.
- [x] Ogni prodotto mostra offerte verificate e candidati espandibili; le alternative manuali richiedono conferma; il sito è solo un comparatore e non vende medicinali.
- [x] Il pannello risultati mostra limite scelto, totale, dettaglio spedizioni e risparmio/costo aggiuntivo oppure perché non è calcolabile.
- [x] TypeScript, 12 test Vitest, build statica, soglie gratuite, minimo sconosciuto e casi 1/2 farmacie controllati.
