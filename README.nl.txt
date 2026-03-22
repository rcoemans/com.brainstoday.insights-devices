Insights Devices integratie voor Homey.

Maak voorgedefinieerde en aangepaste virtuele meetapparaten in Homey die hun gegevens via MQTT ontvangen.

Functies:
- Enkele MQTT broker verbinding op app-niveau met automatische herverbinding
- Vloerverwarming Monitor: volgt aanvoer-/retourtemperaturen en berekent automatisch Delta T
- Grondniveau Monitor: bewaakt grond- of waterniveaus met optionele alarmdrempels
- NRG-Watch Itho CVE: volledige integratie voor Itho Daalderop CVE ventilatiesystemen via MQTT
- Aangepaste MQTT Sensor: flexibel apparaat met ondersteuning voor numerieke, JSON object en JSON array payloads met aangepaste mappings en berekende velden
- Uitgebreide flow kaarten: triggers voor waardewijzigingen, condities met vergelijkingsoperatoren (lt, lte, gt, gte), acties voor bestuurbare apparaten
- Insights logging voor alle metingen
- MQTT broker status monitoring en logging
- Ondersteuning voor TLS/SSL, authenticatie, aangepaste client IDs en LWT (Last Will and Testament)
- Volledig gelokaliseerd in Engels en Nederlands

Ondersteunde Apparaten:
- Vloerverwarming Monitor (sensor klasse)
- Grondniveau Monitor (sensor klasse)
- NRG-Watch Itho CVE (ventilator klasse)
- Aangepaste MQTT Sensor (sensor klasse)

Installatie:
1. Installeer de app op je Homey
2. Configureer MQTT broker instellingen in app configuratie (IP/DNS, poort, optioneel TLS en authenticatie)
3. Voeg apparaten toe via de standaard Homey koppeling flow
4. Configureer MQTT onderwerpen en apparaat-specifieke instellingen voor elk apparaat
5. Apparaten zullen automatisch abonneren op onderwerpen en gegevens ontvangen

MQTT Broker Configuratie:
- Broker IP-adres of DNS naam
- Poortnummer (standaard: 1883 voor standaard, 8883 voor TLS)
- Optioneel TLS/SSL met certificaatvalidatie controle
- Optioneel gebruikersnaam/wachtwoord authenticatie
- Optioneel aangepaste client ID
- Optioneel LWT (Last Will and Testament) configuratie
- Configureerbaar keepalive interval (standaard: 60 seconden)

GEBRUIKSINSTRUCTIES APPARATEN:

1. Vloerverwarming Monitor:
   Hoe te gebruiken:
   - Apparaat toevoegen: Apparaten → Apparaat Toevoegen → Insights Devices → Vloerverwarming Monitor
   - MQTT onderwerp configureren in apparaatinstellingen (bijv. heating/floor1/status)
   - Publiceer JSON berichten: {"flow": 35.2, "return": 29.8}
   - "flow" = aanvoer-/inlaattemperatuur in °C
   - "return" = retour-/uitlaattemperatuur in °C
   - Delta T wordt automatisch berekend als flow - return
   
   Mogelijkheden:
   - Aanvoertemperatuur (In), Retourtemperatuur (Uit), Delta T (Δt)
   
   Flow Kaarten:
   - Triggers: aanvoer-/retour-/delta temperatuur gewijzigd
   - Condities: temperatuurvergelijkingen met operatoren (lt, lte, gt, gte)

2. Grondniveau Monitor:
   Hoe te gebruiken:
   - Apparaat toevoegen: Apparaten → Apparaat Toevoegen → Insights Devices → Grondniveau Monitor
   - Instellingen configureren: MQTT onderwerp (bijv. sensor/crawlSpaceHeight), Eenheid (cm/m/mm), optionele Alarmdrempel
   - Publiceer enkele numerieke waarde: 42.5 (geen JSON omhulling)
   - Waarde vertegenwoordigt niveau in geconfigureerde eenheid
   
   Mogelijkheden:
   - Grondniveau (numeriek met configureerbare eenheid)
   
   Flow Kaarten:
   - Triggers: grondniveau gewijzigd
   - Condities: niveauvergelijkingen met operatoren (lt, lte, gt, gte)

3. NRG-Watch Itho CVE:
   Hoe te gebruiken:
   - Vereisten: Itho Daalderop CVE unit, NRG-Watch add-on geïnstalleerd en publiceert naar MQTT
   - Apparaat toevoegen: Apparaten → Apparaat Toevoegen → Insights Devices → NRG-Watch Itho CVE
   - MQTT onderwerpen configureren in apparaatinstellingen (standaard: itho/ithostatus, itho/state, itho/LWT, itho/cmd)
   - Apparaat abonneert automatisch en verwerkt gegevens
   - Ventilator preset weerspiegelt huidige status (20=Laag, 120=Middel, 220=Hoog)
   - Besturen via apparaatkaart of flow kaarten
   
   Mogelijkheden:
   - Snelheidsstatus (0-255, getoond op kaart), Ventilatorsnelheid (rpm), Ventilator Preset, Ventilatie Setpoint (%), Ventilator Setpoint (rpm)
   - Binnentemperatuur & Luchtvochtigheid, Absolute Luchtvochtigheid (ppmw)
   - Aanvoer- & Afvoertemperaturen (indien beschikbaar), Foutcode, Totale Bedrijfstijd (uren), Online Status
   
   Verwachte MQTT payloads:
   - ithostatus: {"temp":22.9,"hum":39.3,"ppmw":6933,"Ventilation setpoint (%)":30,"Fan setpoint (rpm)":920,"Fan speed (rpm)":923,"Error":0,"Total operation (hours)":27005}
   - state: 120 (enkel getal 0-255)
   
   Flow Kaarten:
   - Triggers: ventilatorsnelheid/preset/sensor wijzigingen, online status wijzigingen
   - Condities: snelheid/temperatuur/luchtvochtigheid vergelijkingen, preset controles, online status
   - Acties: ventilatorsnelheid instellen, ventilatorsnelheid met timer instellen, preset instellen, virtuele afstandsbediening commando's verzenden, wachtrij wissen

4. Aangepaste MQTT Sensor:
   Hoe te gebruiken:
   - Apparaat toevoegen: Apparaten → Apparaat Toevoegen → Insights Devices → Aangepaste MQTT Sensor
   - MQTT onderwerp en payload type configureren (Enkel Getal / JSON Object / JSON Array)
   - Slots configureren in apparaatinstellingen:
     * Getalwaarde 1-4: JSON Pad, Weergavenaam, Eenheid, Decimalen
     * Tekstwaarde 1-2: JSON Pad, Weergavenaam (alleen JSON Object)
     * Berekende Waarde 1-2: Formule (gebruik n1, n2, n3, n4), Weergavenaam, Eenheid, Decimalen
   - Laat JSON Pad of Formule leeg om een slot uit te schakelen
   - Mogelijkheden worden automatisch toegevoegd/verwijderd bij opslaan instellingen
   
   Beschikbare Slots:
   - 4 Getalwaarde slots (voor numerieke gegevens)
   - 2 Tekstwaarde slots (voor string gegevens, alleen JSON Object)
   - 2 Berekende Waarde slots (formules met +, -, *, /, haakjes)
   
   Voorbeeld 1 - Enkel Getal (Grondniveau):
   - MQTT Onderwerp: sensor/crawlSpaceHeight
   - Payload Type: Enkel Getal
   - Getalwaarde 1: JSON Pad = value (of leeg), Label = Grondniveau, Eenheid = cm, Decimalen = 0
   - MQTT Payload: 42.5
   
   Voorbeeld 2 - JSON Object (Itho Laatste Commando):
   - MQTT Onderwerp: itho/lastcmd
   - Payload Type: JSON Object
   - Tekstwaarde 1: JSON Pad = command, Label = Laatste Commando
   - Getalwaarde 1: JSON Pad = timestamp, Label = Tijdstempel, Decimalen = 0
   - MQTT Payload: {"source":"MQTT API","command":"speed:120","timestamp":1774182271}
   
   Voorbeeld 3 - JSON Object met Berekening:
   - MQTT Onderwerp: heating/status
   - Payload Type: JSON Object
   - Getalwaarde 1: JSON Pad = flow, Label = Aanvoer Temp, Eenheid = °C, Decimalen = 1
   - Getalwaarde 2: JSON Pad = return, Label = Retour Temp, Eenheid = °C, Decimalen = 1
   - Berekende Waarde 1: Formule = n1 - n2, Label = Delta T, Eenheid = °C, Decimalen = 1
   - MQTT Payload: {"flow":35.2,"return":28.5}
   - Resultaat: Toont Aanvoer Temp (35.2°C), Retour Temp (28.5°C), Delta T (6.7°C)
   
   JSON Pad formaten:
   - Enkel Getal: leeg laten of "value" invoeren
   - JSON Object: sleutelnaam (bijv. "temp") of genest (bijv. "data.temperature")
   - JSON Array: indexnummer (bijv. "0", "1", "2")
   
   Flow Kaarten:
   - Triggers: waarde gewijzigd (gemapped en berekend)
   - Condities: waarde vergelijkingen met operatoren (lt, lte, gt, gte)

Flow Kaarten:
- App-niveau triggers: broker verbonden, broker verbinding verbroken
- App-niveau condities: broker is/is niet verbonden
- Apparaat-specifieke triggers voor alle waardewijzigingen
- Apparaat-specifieke condities met vergelijkingsoperatoren (lt, lte, gt, gte) en inversie ondersteuning (!{{is|is niet}})
- Apparaat-specifieke acties voor bestuurbare apparaten (NRG-Watch Itho CVE)

Vergelijkingsoperatoren:
- lt = lager dan
- lte = lager dan of gelijk aan
- gt = hoger dan
- gte = hoger dan of gelijk aan

Bekende Beperkingen:
- Enkele MQTT broker per app instantie
- Geen MQTT discovery of auto-discovery
- Aangepaste sensor berekeningen beperkt tot basis rekenkunde (geen functies zoals min/max/avg)
- Berekende velden kunnen geen andere berekende velden refereren in eerste versie
- Wijzigingen in apparaatinstellingen kunnen handmatige herverbinding vereisen

Beveiliging:
- MQTT credentials veilig opgeslagen in Homey instellingen
- TLS/SSL ondersteuning voor versleutelde verbindingen
- Certificaatvalidatie kan worden uitgeschakeld voor zelfondertekende certificaten
- Alle communicatie blijft binnen lokaal netwerk
- Geen cloud of externe verbindingen

Technische Details:
- Protocol: MQTT v3.1.1 / v5.0
- SDK: Homey SDK v3
- Afhankelijkheden: mqtt (MQTT client), expr-eval (formule parser)
- Talen: Engels (en), Nederlands (nl)
