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

Vloerverwarming Monitor:
- Bewaakt aanvoertemperatuur, retourtemperatuur en berekent automatisch Delta T (Δt)
- Verwachte MQTT payload: JSON object met "flow" en "return" velden
- Voorbeeld: {"flow": 35.2, "return": 29.8}
- Triggers: aanvoer-/retour-/delta temperatuur gewijzigd
- Condities: temperatuurvergelijkingen met operatoren
- Alle waarden gelogd naar Insights

Grondniveau Monitor:
- Volgt grond- of waterniveau van een enkele numerieke MQTT payload
- Verwachte MQTT payload: numerieke waarde (bijv. 18.4)
- Optionele alarmdrempel configuratie
- Triggers: grondniveau gewijzigd
- Condities: niveauvergelijkingen met operatoren
- Waarden gelogd naar Insights

NRG-Watch Itho CVE:
- Volledige integratie voor Itho Daalderop CVE ventilatiesystemen
- Leest status van meerdere MQTT onderwerpen (ithostatus, lastcmd, state, LWT, remotesinfo)
- Publiceert commando's om ventilatorsnelheid, presets en modi te regelen
- Mogelijkheden: ventilatorsnelheid, preset, luchtvochtigheid, temperatuur, luchtkwaliteit, aanvoer-/afvoertemperaturen, override timer, foutcodes
- Triggers: ventilatorsnelheid/preset/sensor wijzigingen, apparaat online status, foutcodes
- Condities: snelheid/temperatuur/luchtvochtigheid vergelijkingen, preset controles, online status
- Acties: ventilatorsnelheid instellen (met optionele timer), preset commando's verzenden, virtuele afstandsbediening commando's, wachtrij wissen
- Standaard MQTT onderwerpen configureerbaar in apparaatinstellingen
- Ondersteunt zowel eenvoudige als geavanceerde Itho CVE payloads

Aangepaste MQTT Sensor:
- Geavanceerd flexibel apparaat voor aangepaste MQTT toepassingen
- Ondersteunt drie payload types: enkele numerieke waarde, JSON object, JSON array
- JSON object mapping met puntnotatie (bijv. "heating.flow", "sensors.temp")
- JSON array mapping met indexnotatie (bijv. "0", "1", "2")
- Meerdere bronwaarde mappings per apparaat
- Berekende velden met formules met +, -, *, / en haakjes
- Voorbeeldberekeningen: delta_t = flow - return, avg_temp = (flow + return) / 2
- Configureerbare capability types: measure_temperature, measure_humidity, measure_pressure, measure_level, measure_air_quality, measure_co2, measure_percentage, measure_power, meter_power, custom_numeric
- Per-veld Insights logging configuratie
- Per-veld zichtbaarheid configuratie
- Triggers: gemapte/berekende waarde gewijzigd
- Condities: waarde vergelijkingen met operatoren

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
